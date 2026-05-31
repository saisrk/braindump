'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, BookMarked } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { getLibraryData } from '@/lib/actions/insights'

interface Learning {
  id: string
  title: string
  summary: string
  category: string
  source: string
  createdAt: Date
}

export default function LibraryPage() {
  const [learnings, setLearnings] = useState<Learning[]>([])
  const [filtered, setFiltered] = useState<Learning[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const categories = ['general', 'technical', 'business', 'personal', 'research']

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLibraryData()
        setLearnings(data)
      } catch (error) {
        console.error('[v0] Failed to load library:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    let result = learnings
    if (search) {
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(search.toLowerCase()) ||
          l.summary.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (categoryFilter) {
      result = result.filter((l) => l.category === categoryFilter)
    }
    setFiltered(result)
  }, [search, categoryFilter, learnings])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (learnings.length === 0) {
    return (
      <EmptyState
        icon={BookMarked}
        title="Your library is empty"
        description="Start by capturing your first learning"
        action={
          <Link href="/capture">
            <Button>New Learning</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Library"
        description={`${learnings.length} learnings in your collection`}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your learnings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                categoryFilter === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                  categoryFilter === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No learnings match your search</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((learning) => (
              <Link key={learning.id} href={`/library/${learning.id}`} className="block no-underline">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {learning.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {learning.summary}
                      </p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Badge variant="secondary" className="capitalize text-xs">
                          {learning.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {learning.source}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
