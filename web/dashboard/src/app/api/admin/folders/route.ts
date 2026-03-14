import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const repoRoot = path.resolve(process.cwd(), '../..')
const knowledgeDir = path.resolve(repoRoot, 'knowledge')

function getFolders() {
  if (!fs.existsSync(knowledgeDir)) return []
  return fs.readdirSync(knowledgeDir)
    .filter(name => {
      const full = path.join(knowledgeDir, name)
      return fs.statSync(full).isDirectory()
    })
    .map(name => {
      const full = path.join(knowledgeDir, name)
      const files = fs.readdirSync(full).filter(f => {
        return fs.statSync(path.join(full, f)).isFile()
      })
      return {
        name,
        fileCount: files.length,
        path: `knowledge/${name}`,
      }
    })
}

export async function GET() {
  try {
    return NextResponse.json(getFolders())
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json() as { name: string }
    if (!name || name.includes('..') || name.includes('/')) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 })
    }
    const target = path.join(knowledgeDir, name)
    if (fs.existsSync(target)) {
      return NextResponse.json({ error: 'Folder already exists' }, { status: 409 })
    }
    fs.mkdirSync(target, { recursive: true })
    return NextResponse.json({ success: true, name })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json() as { oldName: string; newName: string }
    if (!oldName || !newName || oldName.includes('..') || newName.includes('..')) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 })
    }
    const oldPath = path.join(knowledgeDir, oldName)
    const newPath = path.join(knowledgeDir, newName)
    if (!fs.existsSync(oldPath)) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }
    fs.renameSync(oldPath, newPath)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const name = request.nextUrl.searchParams.get('name')
    if (!name || name.includes('..') || name.includes('/')) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 })
    }
    const target = path.join(knowledgeDir, name)
    if (!fs.existsSync(target)) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }
    fs.rmSync(target, { recursive: true, force: true })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
