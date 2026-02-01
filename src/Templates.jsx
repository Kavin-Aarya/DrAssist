import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  PrinterIcon, 
  PencilSquareIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Templates({ aiData }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fabricCanvas = useRef(null);

  const [image, setImage] = useState(null);
  const [mode, setMode] = useState('upload'); 
  const [coords, setCoords] = useState(null);

  // --- REPAIRED PRINT LOGIC WITH DEBUGGING ---
  const handleDownloadPDF = async (e) => {
    if (e) e.stopPropagation();
    
    const element = document.getElementById('printable-area');
    if (!element) return;

    try {
      document.body.style.cursor = 'wait';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        // This 'onclone' function fixes the oklch error by forcing safe colors 
        // on the temporary version of the page used for the PDF
        onclone: (clonedDoc) => {
          const area = clonedDoc.getElementById('printable-area');
          if (area) {
            // Force all text to a safe hex color that html2canvas understands
            area.style.color = '#1f2937'; 
            const allElements = area.getElementsByTagName('*');
            for (let el of allElements) {
              // Convert any computed oklch colors to solid black/gray for the screenshot
              el.style.color = '#1f2937';
              el.style.borderColor = '#e5e7eb';
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`${prescription.patientName || 'Patient'}_Prescription.pdf`);
      
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Print failed: This is usually caused by modern CSS colors. Use standard Hex colors in your styles.");
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  const [prescription, setPrescription] = useState({
    patientName: "- ( )",
    medications: [
      { name: "- ( )", dosage: "- ( )", timing: "- ( )", duration: "- ( )" },
    ],
    advice: "- ( )"
  });

  useEffect(() => {
    if (aiData) {
      try {
        const parsed = typeof aiData === 'string' ? JSON.parse(aiData) : aiData;
        const val = (item) => item && item.trim() !== "" ? item : "- ( )";

        setPrescription({
          patientName: val(parsed.patient_name),
          medications: parsed.medications?.length > 0 
            ? parsed.medications.map(m => ({
                name: val(m.name || m.medication),
                dosage: val(m.dosage),
                timing: val(m.timing),
                duration: val(m.duration)
              }))
            : [{ name: "- ( )", dosage: "- ( )", timing: "- ( )", duration: "- ( )" }],
          advice: val(parsed.advice)
        });
      } catch (e) {
        console.error("Error parsing AI Data", e);
      }
    }
  }, [aiData]);

  // Keep your existing Adjust Layout logic exactly as it was
  useEffect(() => {
    let timeoutId;
    const initCanvas = () => {
      if (mode !== 'design' || !image) return;
      const el = document.getElementById('editor-canvas');
      if (!el) {
        timeoutId = setTimeout(initCanvas, 50);
        return;
      }
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }
      const canvas = new fabric.Canvas('editor-canvas', {
        width: 794,
        height: 1123,
        backgroundColor: '#fff'
      });
      fabricCanvas.current = canvas;
      fabric.Image.fromURL(image, (img) => {
        img.set({ 
          scaleX: 794 / img.width, 
          scaleY: 1123 / img.height, 
          selectable: false 
        });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        const typingArea = new fabric.Rect({
          left: coords?.left ?? 50, 
          top: coords?.top ?? 200,
          width: coords?.width ?? 600, 
          height: coords?.height ?? 400,
          fill: 'rgba(63, 139, 140, 0.1)', 
          stroke: '#3f8b8c', 
          strokeWidth: 2, 
          strokeDashArray: [5, 5],
          cornerColor: '#3f8b8c',
          cornerSize: 12,
          transparentCorners: false,
          hasRotatingPoint: false 
        });
        canvas.add(typingArea);
        canvas.setActiveObject(typingArea);
        canvas.on('object:modified', (e) => {
          const obj = e.target;
          setCoords({
            top: obj.top,
            left: obj.left,
            width: obj.getScaledWidth(),
            height: obj.getScaledHeight()
          });
        });
        canvas.renderAll();
      });
    };
    initCanvas();
    return () => {
      clearTimeout(timeoutId);
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
        fabricCanvas.current = null;
      }
    };
  }, [mode, image]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { 
        setImage(e.target.result); 
        setMode('design'); 
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmLayout = () => {
    if (fabricCanvas.current) {
      const activeObject = fabricCanvas.current.getActiveObject();
      if (activeObject) {
        setCoords({
          top: activeObject.top, 
          left: activeObject.left,
          width: activeObject.getScaledWidth(), 
          height: activeObject.getScaledHeight()
        });
        setMode('preview');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 p-6 space-y-6 overflow-hidden min-h-screen">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>

      <div className="flex justify-between items-center no-print relative z-50">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Prescription Editor</h1>
          <p className="text-gray-500 text-sm font-medium">Review and finalize the extracted clinical details before printing</p>
        </div>
       
        <div className="flex gap-3">
          {mode === 'design' && <button onClick={confirmLayout} className="px-6 py-2 bg-[#3f8b8c] text-white rounded-xl font-bold">CONFIRM AREA</button>}
          {mode === 'preview' && (
            <>
              <button onClick={() => setMode('design')} className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold">ADJUST LAYOUT</button>
              <button 
                onClick={(e) => handleDownloadPDF(e)} 
                className="px-6 py-2 bg-black text-white rounded-xl font-bold cursor-pointer hover:bg-gray-800"
              >
                PRINT DOCUMENT
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex justify-center items-start overflow-auto pb-20">
        {mode === 'upload' && (
          <div onClick={() => fileInputRef.current.click()} className="group m-auto flex flex-col items-center border-4 border-dashed border-gray-300 rounded-[3rem] p-24 bg-white cursor-pointer hover:border-[#3f8b8c] transition-all">
            <CloudArrowUpIcon className="w-20 h-20 text-gray-300 group-hover:text-[#3f8b8c] transition-colors duration-300" />
            <h3 className="text-2xl mt-4 font-bold text-gray-500 text-center transition-colors duration-300 group-hover:text-gray-900">Upload Clinic Letterhead</h3>
            <p className="text-gray-500 text-sm mt-5">Select a PNG or JPG file of your official letterhead to customize your prescription layout.</p>
          </div>
        )}

        {mode === 'design' && <div className="bg-white shadow-2xl"><canvas id="editor-canvas" /></div>}

        {mode === 'preview' && (
          <div 
            id="printable-area" 
            className="relative bg-white shadow-2xl overflow-hidden" 
            style={{ width: '794px', height: '1123px', minWidth: '794px' }} // Using px for canvas consistency
          >
            <img src={image} alt="Letterhead" className="absolute inset-0 w-full h-full object-fill" />

            <div 
              contentEditable="true"
              className="absolute text-gray-800 font-serif leading-relaxed text-left focus:outline-none p-2"
              style={{ top: `${coords?.top}px`, left: `${coords?.left}px`, width: `${coords?.width}px`, height: `${coords?.height}px`, fontSize: '13px' }}
            >
              <div className="mb-5">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Patient Name</span>
                <div className="text-base font-bold border-b border-gray-100 pb-1">{prescription.patientName}</div>
              </div>

              <table className="w-full border-collapse mb-5">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left text-[10px] uppercase text-gray-500">
                    <th className="py-1 px-1">Medicine Name</th>
                    <th className="py-1 px-1">Dosage</th>
                    <th className="py-1 px-1">Food Timing</th>
                    <th className="py-1 px-1">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medications.map((med, idx) => (
                    <tr key={idx} className="border-b border-gray-50 text-sm">
                      <td className="py-2 px-1">{med.name}</td>
                      <td className="py-2 px-1">{med.dosage}</td>
                      <td className="py-2 px-1 text-xs">{med.timing}</td>
                      <td className="py-2 px-1">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Advice & Remarks</span>
                <div className="italic text-sm text-gray-700">{prescription.advice}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}