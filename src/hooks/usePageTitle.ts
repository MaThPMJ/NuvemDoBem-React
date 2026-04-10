import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — Nuvem do Bem`
    return () => {
      document.title = 'Nuvem do Bem'
    }
  }, [title])
}
