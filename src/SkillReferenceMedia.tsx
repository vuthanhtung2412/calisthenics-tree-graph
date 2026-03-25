import { useState } from 'react'

function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return id || null
    }
    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com'
    ) {
      if (u.pathname.startsWith('/watch')) {
        return u.searchParams.get('v')
      }
      if (u.pathname.startsWith('/embed/')) {
        return u.pathname.replace(/^\/embed\//, '').split('/')[0] || null
      }
      if (u.pathname.startsWith('/shorts/')) {
        return u.pathname.split('/')[2] || null
      }
    }
  } catch {
    return null
  }
  return null
}

function isLikelyDirectImageUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return /\.(gif|jpe?g|png|webp|avif|svg|bmp|ico)$/i.test(u.pathname)
  } catch {
    return false
  }
}

function ReferenceLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-sm text-violet-400 underline-offset-2 hover:underline"
    >
      Open reference
    </a>
  )
}

function InlineImageRef({
  url,
  label,
}: {
  url: string
  label: string
}) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return <ReferenceLink url={url} />
  }
  return (
    <img
      src={url}
      alt={label}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="max-h-72 w-full rounded-md border border-zinc-800 bg-zinc-900 object-contain"
    />
  )
}

export function SkillReferenceMedia({
  url,
  title,
}: {
  url: string
  title: string
}) {
  const yt = youtubeVideoId(url)
  if (yt) {
    const embedSrc = `https://www.youtube-nocookie.com/embed/${yt}`
    return (
      <div className="space-y-2">
        <div className="aspect-video w-full overflow-hidden rounded-md border border-zinc-800 bg-black">
          <iframe
            title={`${title} — reference video`}
            src={embedSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        </div>
        <ReferenceLink url={url} />
      </div>
    )
  }

  if (isLikelyDirectImageUrl(url)) {
    return (
      <div className="space-y-2">
        <InlineImageRef url={url} label={title} />
        <ReferenceLink url={url} />
      </div>
    )
  }

  return <ReferenceLink url={url} />
}
