import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { getAccessToken, isAuthenticated, logout } from '../utils/auth'
import './DashboardPage.css'

type NewsBlock = {
  type: string
  content: string
}

type NewsItem = {
  id: string
  title: string
  subtitle: string
  coverImageUrl: string
  publishedAtUtc: string
  blocks: NewsBlock[]
}

type CreateNewsRequest = {
  title: string
  subtitle: string
  coverImageUrl: string
  blocks: NewsBlock[]
}

type CreateNewsResponse = {
  id: string
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [news, setNews] = useState<NewsItem[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [newsError, setNewsError] = useState('')

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [blocks, setBlocks] = useState<NewsBlock[]>([
    { type: 'paragraph', content: '' },
  ])
  const [creatingNews, setCreatingNews] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true })
      return
    }

    fetchNews()
  }, [navigate])

  const sortedNews = useMemo(() => {
    return [...news].sort(
      (a, b) =>
        new Date(b.publishedAtUtc).getTime() - new Date(a.publishedAtUtc).getTime()
    )
  }, [news])

  const fetchNews = async () => {
    const token = getAccessToken()

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    setLoadingNews(true)
    setNewsError('')

    try {
      const response = await fetch('/news-api/api/news', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Greška kod dohvaćanja vijesti. Status: ${response.status}`)
      }

      const data: NewsItem[] = await response.json()
      setNews(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setNewsError('Ne mogu dohvatiti vijesti.')
    } finally {
      setLoadingNews(false)
    }
  }

  const handleOpenNews = async (id: string) => {
    const token = getAccessToken()

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    setLoadingDetails(true)
    setDetailsError('')
    setSelectedNews(null)

    try {
      const response = await fetch(`/news-api/api/news/${id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Greška kod dohvaćanja detalja vijesti. Status: ${response.status}`)
      }

      const data: NewsItem = await response.json()
      setSelectedNews(data)
    } catch (err) {
      console.error(err)
      setDetailsError('Ne mogu dohvatiti detalje vijesti.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.replace('/login')
  }

  const handleAddBlock = () => {
    setBlocks((prev) => [...prev, { type: 'paragraph', content: '' }])
  }

  const handleRemoveBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleBlockTypeChange = (index: number, value: string) => {
    setBlocks((prev) =>
      prev.map((block, i) => (i === index ? { ...block, type: value } : block))
    )
  }

  const handleBlockContentChange = (index: number, value: string) => {
    setBlocks((prev) =>
      prev.map((block, i) => (i === index ? { ...block, content: value } : block))
    )
  }

  const resetForm = () => {
    setTitle('')
    setSubtitle('')
    setCoverImageUrl('')
    setBlocks([{ type: 'paragraph', content: '' }])
  }

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = getAccessToken()

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    setCreateError('')
    setCreateSuccess('')

    const cleanedBlocks = blocks
      .map((block) => ({
        type: block.type.trim(),
        content: block.content.trim(),
      }))
      .filter((block) => block.type !== '' && block.content !== '')

    if (!title.trim()) {
      setCreateError('Naslov je obavezan.')
      return
    }

    if (!subtitle.trim()) {
      setCreateError('Podnaslov je obavezan.')
      return
    }

    if (!coverImageUrl.trim()) {
      setCreateError('Cover image URL je obavezan.')
      return
    }

    if (cleanedBlocks.length === 0) {
      setCreateError('Dodaj barem jedan blok sadržaja.')
      return
    }

    const payload: CreateNewsRequest = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      coverImageUrl: coverImageUrl.trim(),
      blocks: cleanedBlocks,
    }

    setCreatingNews(true)

    try {
      const response = await fetch('/news-api/api/news', {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Greška kod kreiranja vijesti. Status: ${response.status}`)
      }

      const data: CreateNewsResponse = await response.json()
      console.log('Kreirana vijest:', data)

      setCreateSuccess('Vijest je uspješno kreirana.')
      resetForm()
      await fetchNews()
    } catch (err) {
      console.error(err)
      setCreateError('Ne mogu kreirati vijest.')
    } finally {
      setCreatingNews(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    return new Intl.DateTimeFormat('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">NK Varaždin Admin</h1>
            <p className="dashboard-subtitle">Upravljanje vijestima</p>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            Odjava
          </button>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <h2 className="panel-title">Nova vijest</h2>

            <form className="news-form" onSubmit={handleCreateNews}>
              <div className="form-group">
                <label htmlFor="title">Naslov</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Unesite naslov vijesti"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subtitle">Podnaslov</label>
                <textarea
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Unesite podnaslov"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="coverImageUrl">Cover image URL</label>
                <input
                  id="coverImageUrl"
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="blocks-header">
                <h3 className="blocks-title">Blokovi sadržaja</h3>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleAddBlock}
                >
                  + Dodaj blok
                </button>
              </div>

              <div className="blocks-list">
                {blocks.map((block, index) => (
                  <div className="block-card" key={index}>
                    <div className="block-card-top">
                      <span className="block-index">Blok {index + 1}</span>

                      {blocks.length > 1 && (
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() => handleRemoveBlock(index)}
                        >
                          Ukloni
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Tip bloka</label>
                      <select
                        value={block.type}
                        onChange={(e) =>
                          handleBlockTypeChange(index, e.target.value)
                        }
                      >
                        <option value="paragraph">paragraph</option>
                        <option value="quote">quote</option>
                        <option value="meta">meta</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Sadržaj</label>
                      <textarea
                        value={block.content}
                        onChange={(e) =>
                          handleBlockContentChange(index, e.target.value)
                        }
                        placeholder="Unesite sadržaj bloka"
                        rows={5}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {createError && <div className="form-error">{createError}</div>}
              {createSuccess && <div className="form-success">{createSuccess}</div>}

              <button
                type="submit"
                className="submit-button"
                disabled={creatingNews}
              >
                {creatingNews ? 'Objavljujem...' : 'Objavi vijest'}
              </button>
            </form>
          </section>

          <section className="dashboard-panel">
            <h2 className="panel-title">Vijesti</h2>

            {loadingNews && <p className="info-text">Dohvaćam vijesti...</p>}
            {newsError && <p className="error-text">{newsError}</p>}

            {!loadingNews && !newsError && sortedNews.length === 0 && (
              <p className="info-text">Nema dostupnih vijesti.</p>
            )}

            <div className="news-list">
              {sortedNews.map((item) => (
                <button
                  key={item.id}
                  className="news-card"
                  onClick={() => handleOpenNews(item.id)}
                  type="button"
                >
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="news-card-image"
                  />

                  <div className="news-card-content">
                    <div className="news-card-date">
                      {formatDate(item.publishedAtUtc)}
                    </div>
                    <h3 className="news-card-title">{item.title}</h3>
                    <p className="news-card-subtitle">{item.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {(selectedNews || loadingDetails || detailsError) && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Detalji vijesti</h2>
              <button
                className="close-button"
                onClick={() => setSelectedNews(null)}
                type="button"
              >
                ×
              </button>
            </div>

            {loadingDetails && <p className="info-text">Dohvaćam detalje vijesti...</p>}
            {detailsError && <p className="error-text">{detailsError}</p>}

            {selectedNews && !loadingDetails && (
              <div className="news-details">
                <img
                  src={selectedNews.coverImageUrl}
                  alt={selectedNews.title}
                  className="news-details-image"
                />

                <div className="news-details-meta">
                  {formatDate(selectedNews.publishedAtUtc)}
                </div>

                <h3 className="news-details-title">{selectedNews.title}</h3>
                <p className="news-details-subtitle">{selectedNews.subtitle}</p>

                <div className="news-blocks">
                  {selectedNews.blocks?.map((block, index) => {
                    if (block.type === 'meta') {
                      return (
                        <p key={index} className="block-meta">
                          {block.content}
                        </p>
                      )
                    }

                    if (block.type === 'quote') {
                      return (
                        <blockquote key={index} className="block-quote">
                          {block.content}
                        </blockquote>
                      )
                    }

                    return (
                      <p key={index} className="block-paragraph">
                        {block.content}
                      </p>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}