import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as fabric from 'fabric';
import {
  CheckIcon, PrinterIcon, DocumentPlusIcon,
  ArrowLeftIcon, TrashIcon, PencilSquareIcon,
  ArrowDownTrayIcon, AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from './AuthContext';

const PAGE_W  = 794;
const PAGE_H  = 1123;
const API     = 'http://localhost:5001/user';

// Helper: resolve the display image URL for a template.
// Server-saved templates have imageUrl ('/uploads/templates/...')
// Locally-created templates (before first save) have image (base64 dataURL)
const tplImg = (tpl) =>
  tpl.imageUrl ? `http://localhost:5001${tpl.imageUrl}` : tpl.image;

// Helper: get auth header from localStorage token
const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
const Field = ({ label, value, onChange, multiline }) => (
  <div style={{ marginBottom: 8 }}>
    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', display: 'block', marginBottom: 3 }}>{label}</span>
    {multiline
      ? <textarea value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid rgba(63,139,140,.3)', borderRadius: 6, padding: '4px 6px', fontSize: 12, fontFamily: "'Outfit',sans-serif", background: 'rgba(63,139,140,.04)', color: '#1e1a14', outline: 'none', minHeight: 48 }} />
      : <input type="text" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', border: '1px solid rgba(63,139,140,.3)', borderRadius: 6, padding: '4px 6px', fontSize: 12, fontFamily: "'Outfit',sans-serif", background: 'rgba(63,139,140,.04)', color: '#1e1a14', outline: 'none' }} />
    }
  </div>
);
export default function Templates({ aiData, selectedPatient }) {
  const { user } = useAuth();

  const fileInputRef = useRef(null);
  const fabricRef    = useRef(null);
  const coordsRef    = useRef({ top: 150, left: 50, width: 694, height: 820 });

  const [view,           setView]           = useState('gallery');
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [loadingTpls,    setLoadingTpls]    = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [newImage,       setNewImage]       = useState(null);   // base64 dataURL
  const [coords,         setCoords]         = useState({ top: 150, left: 50, width: 694, height: 820 });
  const [templateName,   setTemplateName]   = useState('Clinic Template');
  const [canvasReady,    setCanvasReady]    = useState(false);
  const [isSaving,       setIsSaving]       = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [rxEdit,   setRxEdit]   = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // ── Fetch templates from server (filtered by userId server-side) ───────────
  const fetchTemplates = async () => {
    if (!user) return;
    setLoadingTpls(true);
    try {
      const res = await fetch(`${API}/templates`, { headers: authHeader() });
      if (res.ok) setSavedTemplates(await res.json());
      else console.error('Failed to load templates:', res.status);
    } catch (e) {
      console.error('Failed to fetch templates:', e);
    } finally {
      setLoadingTpls(false);
    }
  };

  // Re-fetch whenever the logged-in user changes (accounts switch)
  useEffect(() => {
    setSavedTemplates([]); // clear immediately so previous doctor's templates don't flash
    fetchTemplates();
  }, [user?._id]);           // keyed on user._id — different for each doctor account

  // ── Parse aiData ───────────────────────────────────────────────────────────
  const parsedRx = useMemo(() => {
    if (!aiData) return null;
    try {
      const d = typeof aiData === 'string' ? JSON.parse(aiData) : aiData;
      return {
        patientName: d.patient_name || '- ( )',
        diagnosis:   d.diagnosis    || '- ( )',
        advice:      d.advice       || '- ( )',
        medications: Array.isArray(d.medications) ? d.medications : [],
      };
    } catch { return null; }
  }, [aiData]);

  useEffect(() => {
    if (parsedRx) setRxEdit(JSON.parse(JSON.stringify(parsedRx)));
  }, [parsedRx]);

  const prescription = editMode ? rxEdit : parsedRx;

  // ── Auto-paginate ──────────────────────────────────────────────────────────
  const pages = useMemo(() => {
    if (!activeTemplate?.coords || !prescription) return [];
    const H        = activeTemplate.coords.height;
    const FIRST_OH = 155;
    const CONT_OH  = 45;
    const ADVICE_H = 65;
    const ROW_H    = 46;
    const all      = [...prescription.medications];
    const result   = [];
    let   p        = 1;
    while (all.length > 0) {
      const oh   = p === 1 ? FIRST_OH : CONT_OH;
      const rows = Math.max(1, Math.floor((H - oh - ADVICE_H) / ROW_H));
      result.push(all.splice(0, rows));
      p++;
    }
    if (result.length === 0) result.push([]);
    return result;
  }, [activeTemplate, prescription]);

  // ── Fabric canvas init ─────────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'create' || !newImage) return;
    setCanvasReady(false);
    let disposed = false;

    const tid = setTimeout(async () => {
      const el = document.getElementById('template-canvas');
      if (!el || disposed) return;
      if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }

      try {
        const res    = await fetch(newImage);
        const blob   = await res.blob();
        const bitmap = await createImageBitmap(blob);
        if (disposed) { bitmap.close(); return; }

        const off = document.createElement('canvas');
        off.width = PAGE_W; off.height = PAGE_H;
        off.getContext('2d').drawImage(bitmap, 0, 0, PAGE_W, PAGE_H);
        bitmap.close();
        const scaledUrl = off.toDataURL('image/png');
        if (disposed) return;

        const canvas = new fabric.Canvas('template-canvas', {
          width: PAGE_W, height: PAGE_H,
          backgroundColor: '#ffffff',
          enableRetinaScaling: false,
        });
        fabricRef.current = canvas;

        const bgImg = new Image();
        bgImg.src   = scaledUrl;
        await new Promise(r => { bgImg.onload = r; });
        if (disposed) return;

        const fabricBg = new fabric.FabricImage(bgImg, {
          left: 0, top: 0, scaleX: 1, scaleY: 1,
          selectable: false, evented: false, originX: 'left', originY: 'top',
        });
        canvas.backgroundImage = fabricBg;
        fabricBg.canvas        = canvas;
        canvas.requestRenderAll();
        if (disposed) return;

        const initC = coordsRef.current;
        const rect  = new fabric.Rect({
          left: initC.left, top: initC.top, width: initC.width, height: initC.height,
          fill: 'rgba(63,139,140,0.15)', stroke: '#3f8b8c', strokeWidth: 2.5,
          strokeDashArray: [10, 5], cornerColor: '#1e1a14', cornerSize: 14,
          transparentCorners: false, hasRotatingPoint: false,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);

        const sync = () => {
          const br = rect.getBoundingRect();
          const c  = {
            top:    Math.round(br.top),    left:   Math.round(br.left),
            width:  Math.round(br.width),  height: Math.round(br.height),
          };
          coordsRef.current = c;
          setCoords(c);
        };
        canvas.on('object:modified', sync);
        canvas.on('object:moving',   sync);
        canvas.on('object:scaling',  sync);
        sync();
        canvas.requestRenderAll();
        setCanvasReady(true);
      } catch (err) {
        console.error('Canvas init error:', err);
        setCanvasReady(true);
      }
    }, 100);

    return () => {
      disposed = true;
      clearTimeout(tid);
      if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; }
    };
  }, [view, newImage]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const defaultC = { top: 150, left: 50, width: 694, height: 820 };
    coordsRef.current = defaultC;
    setCoords(defaultC);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewImage(ev.target.result);
      setTemplateName(file.name.replace(/\.[^.]+$/, ''));
      setView('create');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const reEditArea = (tpl, e) => {
    e?.stopPropagation();
    coordsRef.current = { ...tpl.coords };
    setCoords({ ...tpl.coords });
    // works for both server templates (imageUrl) and local ones (image)
    setNewImage(tplImg(tpl));
    setTemplateName(tpl.name);
    setView('create');
  };

  const saveTemplate = async () => {
    if (!newImage) return alert('Please upload a letterhead image first.');
    setIsSaving(true);
    try {
      // Convert base64 dataURL → Blob using offscreen canvas (avoids fetch() on data: URL)
      const off = document.createElement('canvas');
      off.width = PAGE_W; off.height = PAGE_H;
      const bitmap = await createImageBitmap(await (await fetch(newImage)).blob());
      off.getContext('2d').drawImage(bitmap, 0, 0, PAGE_W, PAGE_H);
      bitmap.close();

      const blob = await new Promise(r => off.toBlob(r, 'image/png'));

      const form = new FormData();
      // Append blob ONCE as 'image' — matches uploadTemplate.single('image') in route
      form.append('image',      blob, `${templateName.trim() || 'template'}.png`);
      form.append('name',       templateName.trim() || 'Untitled Template');
      form.append('doctorName', user?.name || '');
      form.append('coords',     JSON.stringify(coordsRef.current));

      const res = await fetch(`${API}/save-template`, {
        method:  'POST',
        headers: authHeader(),   // NO Content-Type header — browser sets multipart boundary
        body:    form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }

      // Server returns the template document directly (not wrapped in { template: ... })
      const saved = await res.json();

      // 'saved' has: _id, name, imageUrl, coords, userId, createdAt
      setSavedTemplates(prev => [saved, ...prev]);
      setActiveTemplate(saved);
      setView('preview');
    } catch (err) {
      console.error('Save template error:', err);
      alert(`Could not save template: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTemplate = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this template?')) return;
    try {
      const res = await fetch(`${API}/templates/${id}`, {
        method: 'DELETE', headers: authHeader()
      });
      if (res.ok) {
        setSavedTemplates(prev => prev.filter(t => t._id !== id));
        if (activeTemplate?._id === id) setActiveTemplate(null);
      }
    } catch (err) { console.error('Delete failed:', err); }
  };

  const saveTemplateToDevice = (tpl, e) => {
    e?.stopPropagation();
    const link    = document.createElement('a');
    link.href     = tplImg(tpl);
    link.download = `${tpl.name.replace(/[^a-z0-9]/gi, '_')}_template.png`;
    link.click();
  };

  const downloadPDF = async () => {
    setIsPrinting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const els = Array.from(document.querySelectorAll('.rx-page'));
      for (let i = 0; i < els.length; i++) {
        const cvs = await html2canvas(els[i], {
          scale: 2, useCORS: true, backgroundColor: '#ffffff',
          onclone: (doc) => {
            doc.querySelectorAll('.rx-page')[i]?.querySelectorAll('*')
              .forEach(el => { el.style.color = '#1f2937'; el.style.borderColor = '#e5e7eb'; });
          },
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(cvs.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      }
      const patientName  = selectedPatient?.name || prescription?.patientName || 'Prescription';
      const safeFilename = `${patientName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
      const pdfBlob      = pdf.output('blob');
      const form         = new FormData();
      form.append('pdf', pdfBlob, safeFilename);

      const res = await fetch(`${API}/save-prescription-pdf`, { 
        method: 'POST', 
        headers: authHeader(), 
        body: form 
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Prescription saved to:\nuploads/prescriptions/${data.fileName}`);
      } else {
        throw new Error('Server returned ' + res.status);
      }
    } catch (err) {
      console.error('PDF save error:', err);
      alert('Failed to save prescription. Check that the server is running.');
    } finally { setIsPrinting(false); }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const pageBg   = { minHeight: '100vh', fontFamily: "'Outfit', sans-serif", background: '#f0ebe3', backgroundImage: 'radial-gradient(ellipse 70% 50% at 80% 10%, rgba(63,139,140,.13) 0%, transparent 65%)', padding: 32 };
  const glass    = { background: 'rgba(255,255,255,.62)', border: '1px solid rgba(255,255,255,.9)', backdropFilter: 'blur(24px)', borderRadius: 20 };
  const btn      = { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", border: 'none' };
  const btnPri   = { ...btn, background: 'linear-gradient(135deg,#3f8b8c,#2d6667)', color: '#fff', boxShadow: '0 3px 14px rgba(63,139,140,.28)' };
  const btnDark  = { ...btn, background: '#1e1a14', color: '#fff', boxShadow: '0 3px 14px rgba(30,26,20,.22)' };
  const btnGhost = { ...btn, background: 'rgba(255,255,255,.62)', border: '1.5px solid rgba(200,185,165,.55)', color: '#7a6e5e', backdropFilter: 'blur(8px)' };
  const btnSm    = { ...btn, padding: '7px 14px', fontSize: 12 };

  

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={pageBg}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileSelect} />

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          {view !== 'gallery' && (
            <button onClick={() => { setView('gallery'); setEditMode(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#9a8a78', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 10, fontFamily: "'Outfit',sans-serif" }}>
              <ArrowLeftIcon style={{ width: 14, height: 14 }} /> Back to Gallery
            </button>
          )}
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e1a14', letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}>
            {view === 'gallery' ? 'Prescription Templates' : view === 'create' ? 'Define Content Area' : 'Prescription Preview'}
          </h1>
          <p style={{ fontSize: 13, color: '#9a8a78', marginTop: 6 }}>
            {view === 'gallery' && 'Upload a letterhead, define the content area, then use it with any voice recording'}
            {view === 'create'  && 'Drag and resize the teal box to mark exactly where prescription content will appear'}
            {view === 'preview' && (pages.length > 1 ? `${pages.length} pages — content automatically split` : 'Review and edit before downloading')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {view === 'gallery' && (
            <button onClick={() => fileInputRef.current?.click()} style={btnPri}>
              <DocumentPlusIcon style={{ width: 16, height: 16 }} /> Upload New Template
            </button>
          )}
          {view === 'create' && (<>
            <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)}
              placeholder="Template name…"
              style={{ padding: '10px 16px', background: 'rgba(255,255,255,.7)', border: '1.5px solid rgba(200,185,165,.5)', borderRadius: 12, fontSize: 13, fontFamily: "'Outfit',sans-serif", color: '#1e1a14', outline: 'none', width: 200 }} />
            <button onClick={saveTemplate} disabled={!canvasReady || isSaving}
              style={{ ...btnPri, opacity: (canvasReady && !isSaving) ? 1 : 0.5, cursor: (canvasReady && !isSaving) ? 'pointer' : 'not-allowed' }}>
              {isSaving
                ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} /> Saving…</>
                : <><CheckIcon style={{ width: 16, height: 16 }} /> Save &amp; Use</>
              }
            </button>
          </>)}
          {view === 'preview' && (<>
            {activeTemplate && (
              <button onClick={() => reEditArea(activeTemplate)} style={btnGhost}>
                <AdjustmentsHorizontalIcon style={{ width: 16, height: 16 }} /> Redefine Area
              </button>
            )}
            <button onClick={() => setEditMode(m => !m)}
              style={{ ...btnGhost, borderColor: editMode ? 'rgba(63,139,140,.5)' : 'rgba(200,185,165,.55)', color: editMode ? '#2d7071' : '#7a6e5e', background: editMode ? 'rgba(63,139,140,.08)' : 'rgba(255,255,255,.62)' }}>
              <PencilSquareIcon style={{ width: 16, height: 16 }} />
              {editMode ? 'Done Editing' : 'Edit Content'}
            </button>
            <button onClick={downloadPDF} disabled={isPrinting}
              style={{ ...btnDark, opacity: isPrinting ? 0.6 : 1 }}>
              <PrinterIcon style={{ width: 16, height: 16 }} />
              {isPrinting ? 'Saving…' : `Download PDF (${pages.length}p)`}
            </button>
          </>)}
        </div>
      </div>

      {/* ── GALLERY ── */}
      {view === 'gallery' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          <div onClick={() => fileInputRef.current?.click()}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f8b8c'; e.currentTarget.style.background = 'rgba(63,139,140,.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,185,165,.5)'; e.currentTarget.style.background = 'rgba(255,255,255,.35)'; }}
            style={{ minHeight: 300, borderRadius: 20, border: '2px dashed rgba(200,185,165,.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,.35)', gap: 10, transition: 'all .2s' }}>
            <DocumentPlusIcon style={{ width: 36, height: 36, color: '#c0b0a0' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a09080', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Upload New</span>
          </div>

          {loadingTpls && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9a8a78', fontSize: 13, padding: '40px 0' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: '3px solid rgba(63,139,140,.2)', borderTopColor: '#3f8b8c', animation: 'spin .7s linear infinite' }} />
              Loading your templates…
            </div>
          )}

          {!loadingTpls && savedTemplates.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', opacity: 0.4, padding: '40px 0' }}>
              <p style={{ fontSize: 14, color: '#7a6e5e' }}>No templates yet — upload your first letterhead</p>
            </div>
          )}

          {savedTemplates.map(tpl => (
            <div key={tpl._id}
              onClick={() => { setActiveTemplate(tpl); setEditMode(false); setView('preview'); }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(63,139,140,.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(80,60,30,.08)'; }}
              style={{ borderRadius: 20, overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,.62)', border: '1px solid rgba(255,255,255,.9)', boxShadow: '0 4px 16px rgba(80,60,30,.08)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', transition: 'all .2s' }}>
              <div style={{ height: 240, position: 'relative', overflow: 'hidden', background: '#f5f0eb' }}>
                <img src={tplImg(tpl)} alt={tpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {tpl.coords && (
                  <div style={{
                    position: 'absolute',
                    top:    `${(tpl.coords.top    / PAGE_H) * 100}%`,
                    left:   `${(tpl.coords.left   / PAGE_W) * 100}%`,
                    width:  `${(tpl.coords.width  / PAGE_W) * 100}%`,
                    height: `${(tpl.coords.height / PAGE_H) * 100}%`,
                    border: '2px solid #3f8b8c', background: 'rgba(63,139,140,.14)', pointerEvents: 'none'
                  }} />
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e1a14', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', marginBottom: 8 }}>{tpl.name}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={e => reEditArea(tpl, e)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(63,139,140,.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(63,139,140,.06)'}
                    style={{ ...btnSm, flex: 1, background: 'rgba(63,139,140,.06)', border: '1px solid rgba(63,139,140,.2)', color: '#2d7071', justifyContent: 'center' }}>
                    <AdjustmentsHorizontalIcon style={{ width: 13, height: 13 }} /> Edit Area
                  </button>
                  <button onClick={e => saveTemplateToDevice(tpl, e)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,185,165,.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,185,165,.15)'}
                    style={{ ...btnSm, background: 'rgba(200,185,165,.15)', border: '1px solid rgba(200,185,165,.4)', color: '#7a6e5e', justifyContent: 'center' }}>
                    <ArrowDownTrayIcon style={{ width: 13, height: 13 }} />
                  </button>
                  <button onClick={e => deleteTemplate(tpl._id, e)}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,185,165,.15)'}
                    style={{ ...btnSm, background: 'rgba(200,185,165,.15)', border: '1px solid rgba(200,185,165,.4)', color: '#ef4444', justifyContent: 'center' }}>
                    <TrashIcon style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE (fabric canvas) ── */}
      {view === 'create' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {!canvasReady && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9a8a78', fontSize: 13, padding: '12px 0' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: '3px solid rgba(63,139,140,.2)', borderTopColor: '#3f8b8c', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
              Loading template…
            </div>
          )}
          <div style={{ background: 'rgba(0,0,0,.06)', borderRadius: 32, padding: 40, overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ boxShadow: '0 8px 48px rgba(0,0,0,.2)', background: '#fff', lineHeight: 0 }}>
              <canvas id="template-canvas" />
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {view === 'preview' && activeTemplate && (
        <div>
          {selectedPatient && (
            <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(63,139,140,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#2d7071', flexShrink: 0 }}>
                {selectedPatient.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e1a14' }}>{selectedPatient.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#9a8a78' }}>{selectedPatient.phone}{selectedPatient.condition ? ` · ${selectedPatient.condition}` : ''}</p>
              </div>
              {prescription && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#2d7071', background: 'rgba(63,139,140,.08)', border: '1px solid rgba(63,139,140,.2)', padding: '5px 12px', borderRadius: 8 }}>
                  {pages.length}p · {prescription.medications.length} med{prescription.medications.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Edit panel */}
          {editMode && rxEdit && (
            <div style={{ ...glass, padding: '20px 24px', marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#9a8a78', margin: '0 0 16px' }}>Edit Prescription Content</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field label="Patient Name" value={rxEdit.patientName} onChange={v => setRxEdit(r => ({ ...r, patientName: v }))} />
                <Field label="Diagnosis"    value={rxEdit.diagnosis}   onChange={v => setRxEdit(r => ({ ...r, diagnosis: v }))} />
              </div>
              <Field label="Advice & Instructions" value={rxEdit.advice} multiline onChange={v => setRxEdit(r => ({ ...r, advice: v }))} />
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', margin: '12px 0 8px' }}>Medications</p>
              {rxEdit.medications.map((m, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                  <Field label={i === 0 ? 'Medication' : ''} value={m.name || m.medication || ''}
                    onChange={v => setRxEdit(r => { const meds = [...r.medications]; meds[i] = { ...meds[i], name: v, medication: v }; return { ...r, medications: meds }; })} />
                  <Field label={i === 0 ? 'Dosage' : ''} value={m.dosage || ''}
                    onChange={v => setRxEdit(r => { const meds = [...r.medications]; meds[i] = { ...meds[i], dosage: v }; return { ...r, medications: meds }; })} />
                  <Field label={i === 0 ? 'Duration' : ''} value={m.duration || ''}
                    onChange={v => setRxEdit(r => { const meds = [...r.medications]; meds[i] = { ...meds[i], duration: v }; return { ...r, medications: meds }; })} />
                  <button onClick={() => setRxEdit(r => ({ ...r, medications: r.medications.filter((_, j) => j !== i) }))}
                    style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 8 }}>
                    <TrashIcon style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              ))}
              <button onClick={() => setRxEdit(r => ({ ...r, medications: [...r.medications, { name: '', medication: '', dosage: '', timing: '', duration: '' }] }))}
                style={{ ...btnSm, background: 'rgba(63,139,140,.08)', border: '1px solid rgba(63,139,140,.2)', color: '#2d7071', marginTop: 4 }}>
                + Add Medication
              </button>
            </div>
          )}

          <div style={{ overflowX: 'auto', paddingBottom: 60 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 40, minWidth: PAGE_W }}>

              {/* No prescription yet — show blank template with area outline */}
              {(!prescription || pages.length === 0) && (
                <div className="rx-page" style={{ position: 'relative', width: PAGE_W, height: PAGE_H, flexShrink: 0, boxShadow: '0 8px 40px rgba(0,0,0,.14)', overflow: 'hidden' }}>
                  <img src={tplImg(activeTemplate)} alt="letterhead"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill' }} />
                  {activeTemplate.coords && (
                    <div style={{
                      position: 'absolute', border: '1.5px dashed rgba(63,139,140,.4)', background: 'rgba(63,139,140,.03)',
                      top:    `${activeTemplate.coords.top}px`,
                      left:   `${activeTemplate.coords.left}px`,
                      width:  `${activeTemplate.coords.width}px`,
                      height: `${activeTemplate.coords.height}px`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Outfit',sans-serif", fontSize: 13, color: '#9ca3af', fontStyle: 'italic',
                    }}>Prescription content will appear here</div>
                  )}
                </div>
              )}

              {/* Paginated prescription pages */}
              {prescription && pages.map((meds, pi) => {
                const isFirst = pi === 0;
                const isLast  = pi === pages.length - 1;
                const C       = activeTemplate.coords;
                return (
                  <div key={pi} className="rx-page"
                    style={{ position: 'relative', width: PAGE_W, height: PAGE_H, flexShrink: 0, boxShadow: '0 8px 40px rgba(0,0,0,.14)', overflow: 'hidden' }}>
                    <img src={tplImg(activeTemplate)} alt="letterhead"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill' }} />
                    <div style={{
                      position: 'absolute',
                      top:    `${C.top}px`,
                      left:   `${C.left}px`,
                      width:  `${Math.min(C.width,  PAGE_W - C.left)}px`,
                      height: `${Math.min(C.height, PAGE_H - C.top)}px`,
                      overflow: 'hidden', boxSizing: 'border-box', padding: '2px 4px',
                      fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#1f2937', lineHeight: 1.6,
                    }}>
                      {isFirst && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#1e1a14', borderBottom: '2.5px solid #3f8b8c', paddingBottom: 5, marginBottom: 10 }}>MEDICAL PRESCRIPTION</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 4 }}>
                            <div>
                              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', display: 'block', marginBottom: 2 }}>Patient</span>
                              <b>{selectedPatient?.name || prescription.patientName || '- ( )'}</b>
                            </div>
                            {selectedPatient?.phone && (
                              <div>
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', display: 'block', marginBottom: 2 }}>Phone</span>
                                {selectedPatient.phone}
                              </div>
                            )}
                            {prescription.diagnosis && prescription.diagnosis !== '- ( )' && (
                              <div style={{ gridColumn: '1 / -1' }}>
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', display: 'block', marginBottom: 2 }}>Diagnosis</span>
                                <b>{prescription.diagnosis}</b>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {!isFirst && (
                        <div style={{ marginBottom: 10, paddingBottom: 5, borderBottom: '1px dashed #e5e7eb', fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>
                          {selectedPatient?.name || prescription.patientName} — continued (page {pi + 1})
                        </div>
                      )}
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8, tableLayout: 'fixed', maxWidth: '100%' }}>
                        <colgroup><col style={{ width: '38%' }} /><col style={{ width: '37%' }} /><col style={{ width: '25%' }} /></colgroup>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #1e1a14', textAlign: 'left' }}>
                            {['Medication', 'Dosage & Timing', 'Duration'].map(h => (
                              <th key={h} style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#374151', padding: '3px 4px 6px' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {meds.length === 0
                            ? <tr><td colSpan={3} style={{ padding: '12px 4px', color: '#9ca3af', fontStyle: 'italic', fontSize: 12 }}>No medications recorded</td></tr>
                            : meds.map((m, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '7px 4px', fontSize: 12, fontWeight: 700, overflow: 'hidden', wordBreak: 'break-word' }}>{m.name || m.medication || '—'}</td>
                                <td style={{ padding: '7px 4px', fontSize: 11, color: '#4b5563', overflow: 'hidden', wordBreak: 'break-word' }}>{[m.dosage, m.timing].filter(Boolean).join(' — ')}</td>
                                <td style={{ padding: '7px 4px', fontSize: 11, overflow: 'hidden', wordBreak: 'break-word' }}>{m.duration || '—'}</td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                      {isLast && prescription.advice && prescription.advice !== '- ( )' && (
                        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
                          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#3f8b8c', display: 'block', marginBottom: 4 }}>Advice &amp; Instructions</span>
                          <p style={{ margin: 0, fontSize: 12, fontStyle: 'italic', color: '#374151', lineHeight: 1.7 }}>{prescription.advice}</p>
                        </div>
                      )}
                      {pages.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 9, color: '#d1d5db', fontFamily: 'monospace' }}>
                          {pi + 1} / {pages.length}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}