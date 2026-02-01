export default function History() {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          History
        </h1>
        <p className="text-gray-500 text-sm font-medium">
        Access and review previous patient consultations and generated prescriptions
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Feature Development Card */}
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-[2.5rem] p-12 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            In the lab: We're calibrating this tool for precision.
          </h2>
          
          <p className="text-gray-500 text-sm leading-relaxed px-4">
          Our engineers are fine-tuning this feature to ensure seamless access, medical-grade security and archival accuracy for your patient prescription history.
          </p>

        </div>
        
      </div>
    </div>
    );
  }