import { useState, useEffect, useCallback } from 'react'
import {
  Quote,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Shuffle,
  Sparkles,
  Plus,
  Palette
} from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

const THEMES = [
  { id: 'emerald', name: 'Emerald Silk', class: 'theme-emerald' },
  { id: 'aurora', name: 'Aurora Twilight', class: 'theme-aurora' },
  { id: 'obsidian', name: 'Obsidian Velvet', class: 'theme-obsidian' },
  { id: 'amber', name: 'Golden Harvest', class: 'theme-amber' }
]

export default function QuotesAnimationCard({ onOpenAddQuote }) {
  const { quotes } = useDashboard()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [activeTheme, setActiveTheme] = useState(THEMES[0])
  const [progress, setProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentQuote = quotes[currentIndex] || quotes[0]
  const DURATION = 7000 // 7 seconds per quote

  const handleNext = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length)
      setProgress(0)
      setIsTransitioning(false)
    }, 280)
  }, [quotes.length])

  // Auto-advancing quote timer with smooth progress bar
  useEffect(() => {
    if (!isPlaying) return

    const interval = 100
    const step = (interval / DURATION) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isPlaying, handleNext])


  const handlePrev = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length)
      setProgress(0)
      setIsTransitioning(false)
    }, 280)
  }

  const handleShuffle = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length)
      setCurrentIndex(randomIndex)
      setProgress(0)
      setIsTransitioning(false)
    }, 280)
  }

  const cycleTheme = () => {
    const nextIdx = (THEMES.findIndex((t) => t.id === activeTheme.id) + 1) % THEMES.length
    setActiveTheme(THEMES[nextIdx])
  }

  return (
    <div className={`dashboard-widget quotes-animated-widget ${activeTheme.class}`}>
      {/* Animated ambient backdrop elements */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-grid-overlay" />

      {/* Widget Header */}
      <div className="widget-header quotes-widget-header">
        <div className="widget-title-area">
          <div className="widget-badge-row">
            <span className="widget-wireframe-tag">random smooth theme with movieing quotes and animations</span>
            <span className="theme-pill" onClick={cycleTheme} title="Click to cycle smooth animation theme">
              <Palette size={11} /> {activeTheme.name}
            </span>
          </div>
          <div className="quotes-heading-wrap">
            <Sparkles size={16} className="sparkle-icon" />
            <h3 className="widget-title">Wisdom & Impact Stream</h3>
          </div>
        </div>

        <div className="widget-controls quotes-top-controls">
          <button
            type="button"
            className="quote-ctrl-btn"
            onClick={cycleTheme}
            title={`Switch Theme (Current: ${activeTheme.name})`}
          >
            <Palette size={14} />
          </button>
          {onOpenAddQuote && (
            <button
              type="button"
              className="quote-ctrl-btn"
              onClick={onOpenAddQuote}
              title="Add Custom Quote"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Animated Quote Content */}
      <div className="quote-body-wrap">
        <div className="quote-icon-watermark">
          <Quote size={52} />
        </div>

        <div className={`quote-content-container ${isTransitioning ? 'fading-out' : 'fading-in'}`}>
          {currentQuote?.tag && (
            <span className="quote-tag-badge">
              #{currentQuote.tag}
            </span>
          )}

          <p className="quote-text">
            “{currentQuote?.quote}”
          </p>

          <div className="quote-author-row">
            <div className="author-avatar-badge">
              {currentQuote?.author ? currentQuote.author.substring(0, 2).toUpperCase() : 'SM'}
            </div>
            <div className="author-meta">
              <span className="author-name">{currentQuote?.author}</span>
              <span className="author-role">{currentQuote?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="quote-progress-track">
        <div
          className="quote-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Footer Controls: Prev, Play/Pause, Next, Shuffle */}
      <div className="quotes-footer-bar">
        <div className="quote-counter">
          <span>Quote <strong>{currentIndex + 1}</strong> of {quotes.length}</span>
        </div>

        <div className="quote-playback-actions">
          <button
            type="button"
            className="playback-btn"
            onClick={handlePrev}
            title="Previous Quote"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            className="playback-btn play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause auto-cycle' : 'Play auto-cycle'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button
            type="button"
            className="playback-btn"
            onClick={handleNext}
            title="Next Quote"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="playback-btn"
            onClick={handleShuffle}
            title="Shuffle Quote"
          >
            <Shuffle size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
