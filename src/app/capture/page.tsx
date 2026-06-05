'use client';

import CaptureForm from '@/components/CaptureForm';

export default function CapturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Capture</h1>
        <p className="text-sm text-slate-500 mt-1">
          Paste a URL or text — AI will summarize it for you.
        </p>
      </div>
      <CaptureForm />
    </div>
  );
}
