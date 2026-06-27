export default function CVPage() {
  return (
    <div style={{ flex: 1, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <object 
        data="/cv.pdf#view=FitH&toolbar=0&navpanes=0" 
        type="application/pdf" 
        style={{ flex: 1, width: "100%", height: "100%" }}
      >
        <div className="flex items-center justify-center w-full h-full text-[var(--sidebar-fg)]">
          <p>It appears your browser does not support embedded PDFs. <a href="/cv.pdf" target="_blank" className="text-[var(--token-keyword)] underline" rel="noreferrer">Click here to view it.</a></p>
        </div>
      </object>
    </div>
  );
}
