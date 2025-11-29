"use client"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function FrameTest() {
  const [side, setSide] = useState<'right' | 'left'>('right')
  const [angle, setAngle] = useState<number>(90)
  const [widthRem, setWidthRem] = useState<number>(20)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [measure, setMeasure] = useState<{w:number;h:number} | null>(null)

  useEffect(() => {
    // apply CSS vars to root so the frame updates everywhere if needed
    const rotateDeg = `${angle}deg`
    document.documentElement.style.setProperty('--frame-rotate', rotateDeg)
    document.documentElement.style.setProperty('--frame-width', `${widthRem}rem`)
  }, [angle, widthRem])

  function measurePanel() {
    const el = panelRef.current
    if (!el) return setMeasure(null)
    const rect = el.getBoundingClientRect()
    setMeasure({ w: Math.round(rect.width), h: Math.round(rect.height) })
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Frame preview / interactive test</h1>
        <p className="text-sm text-gray-600">Use the controls to adjust frame side, rotation, and scale. Click Measure to read the panel size.</p>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3 items-center">
            <label className="text-sm">Side:</label>
            <button className={`px-3 py-1 rounded ${side==='left'?'bg-gray-200':'bg-white'}`} onClick={() => setSide('left')}>Left</button>
            <button className={`px-3 py-1 rounded ${side==='right'?'bg-gray-200':'bg-white'}`} onClick={() => setSide('right')}>Right</button>
          </div>

          <div className="flex gap-3 items-center">
            <label className="text-sm">Rotation:</label>
            <input type="range" min="-180" max="180" value={angle} onChange={e => setAngle(Number(e.target.value))} />
            <span className="text-sm w-12 text-right">{angle}°</span>
          </div>

          <div className="flex gap-3 items-center">
            <label className="text-sm">Scale (rem):</label>
            <input type="range" min="8" max="36" value={widthRem} onChange={e => setWidthRem(Number(e.target.value))} />
            <span className="text-sm w-12 text-right">{widthRem}rem</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <aside ref={panelRef} className="glass-panel rounded-3xl p-8 text-gray-900 relative overflow-hidden">
              <svg className={`frame-decor ${side==='right'?'frame-decor--right':'frame-decor--left'}`} viewBox="0 0 100 100" aria-hidden>
                <image href="/blank-antique-gold-picture-frame-png.webp" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
              </svg>
              <div className="relative z-10 pr-0 sm:pr-36">
                <div className="flex items-center gap-3 text-sm font-semibold text-crimson">
                  <BookOpen className="h-5 w-5" /> Weekly focus plan
                </div>
                <p className="mt-3 text-sm">This is the live panel used for measuring. Resize the window to see responsive widths.</p>
              </div>
            </aside>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={measurePanel} className="btn-crimson px-4 py-2">Measure panel</button>
          <button onClick={() => { setAngle(90); setWidthRem(20); setSide('right') }} className="px-3 py-2 border rounded">Reset</button>
          {measure ? (
            <div className="text-sm text-gray-700">Panel size: <strong>{measure.w}px</strong> × <strong>{measure.h}px</strong></div>
          ) : (
            <div className="text-sm text-gray-500">Panel size: not measured</div>
          )}
        </div>

        <div className="text-sm text-gray-600">If the frame still doesn't match, tell me and I'll provide the homepage panel exact width I used (or capture it live).</div>

        <div className="mt-4">
          <Link href="/" className="text-crimson font-semibold">← Back to home</Link>
        </div>
      </div>
    </main>
  )
}
