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
import type { LearningWithMeta } from '@/lib/data/learnings'

export default function LibraryPage() {
  const [learnings, setLearnings] = useState<LearningWithMeta[]>([])
  const [filtered, setFiltered] = useState<LearningWithMeta[]>([])
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
          l.learning.title.toLowerCase().includes(search.toLowerCase()) ||
          l.learning.summary?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (categoryFilter) {
      result = result.filter((l) => l.learning.topic === categoryFilter)
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
        icon={<BookMarked className="h-12 w-12" />}
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
        subtitle={`${learnings.length} learnings in your collection`}
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
            {filtered.map((item) => (
              <Link key={item.learning.id} href={`/library/${item.learning.id}`} className="block no-underline">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {item.learning.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {item.learning.summary}
                      </p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {item.learning.topic && (
                          <Badge variant="secondary" className="capitalize text-xs">
                            {item.learning.topic}
                          </Badge>
                        )}
                        {item.learning.sourceRef && (
                          <Badge variant="outline" className="text-xs">
                            {item.learning.sourceRef.split('/')[2]}
                          </Badge>
                        )}
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
