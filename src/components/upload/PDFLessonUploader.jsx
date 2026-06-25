import React, { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, RefreshCw, Loader } from "lucide-react";

export default function PDFLessonUploader({
  onFileLoaded,
  isProcessing,
  progress,
  statusLine,
  error,
  generatedLesson,
  onReset,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ["application/pdf", "text/plain", "text/markdown"];
    const ext = file.name.split(".").pop().toLowerCase();
    
    if (validTypes.includes(file.type) || ["pdf", "txt", "md"].includes(ext)) {
      setSelectedFile(file);
      if (onFileLoaded) {
        onFileLoaded(file);
      }
    } else {
      alert("Invalid file type. Please upload a PDF, TXT or MD file.");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (onReset) onReset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Box */}
      {!selectedFile && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-accent-blue bg-accent-blue/10 scale-[0.99] shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              : "border-white/10 bg-black/25 hover:bg-black/45 hover:border-white/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            className="hidden"
            onChange={handleChange}
          />
          <div className="w-14 h-14 rounded-full bg-accent-blue/10 flex items-center justify-center mb-4 border border-accent-blue/20 transition-transform">
            <Upload className="text-accent-blue" size={24} />
          </div>
          <p className="text-text-primary font-medium mb-1 font-sans text-sm text-center">
            Drag & drop PDF, TXT, or MD files here
          </p>
          <p className="text-text-dim text-xs text-center font-mono">
            or click to browse from files (Max 10MB)
          </p>
        </div>
      )}

      {/* Selected File Details */}
      {selectedFile && !generatedLesson && (
        <div className="p-4 rounded-xl border border-white/5 bg-black/30 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent-purple/10 rounded-lg border border-accent-purple/20">
              <FileText className="text-accent-purple" size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-text-primary truncate max-w-[200px] md:max-w-sm">
                {selectedFile.name}
              </p>
              <p className="text-xs text-text-dim font-mono">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={removeFile}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-text-faint hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Progress Telemetry */}
      {isProcessing && (
        <div className="space-y-2 p-4 rounded-xl bg-black/20 border border-white/5 transition-all duration-300">
          <div className="flex justify-between text-xs text-text-dim font-mono items-center">
            <span className="flex items-center gap-2">
              <Loader size={12} className="animate-spin text-accent-pink" />
              {statusLine || "Extracting contents..."}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-pink transition-all duration-300 ease-out shadow-[0_0_10px_var(--pink)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Output */}
      {error && (
        <div className="p-4 rounded-xl border border-accent-pink/30 bg-accent-pink/5 flex items-start gap-3 transition-all duration-300">
          <AlertCircle className="text-accent-pink shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-text-dim leading-relaxed font-mono">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
