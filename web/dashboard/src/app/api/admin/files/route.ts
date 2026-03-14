import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const repoRoot = path.resolve(process.cwd(), '../..')
const knowledgeDir = path.resolve(repoRoot, 'knowledge')

export async function GET(request: NextRequest) {
  try {
    const folder = request.nextUrl.searchParams.get('folder')
    const contentMode = request.nextUrl.searchParams.get('content')
    const filePath = request.nextUrl.searchParams.get('path')

    // Content read mode: ?path=folder/file&content=true
    if (contentMode === 'true' && filePath) {
      if (filePath.includes('..')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
      }
      const fullPath = path.join(knowledgeDir, filePath)
      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      const content = fs.readFileSync(fullPath, 'utf-8')
      return NextResponse.json({ content })
    }

    if (!folder || folder.includes('..')) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
    }
    const dirPath = path.join(knowledgeDir, folder)
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json([])
    }
    const files = fs.readdirSync(dirPath)
      .filter(name => fs.statSync(path.join(dirPath, name)).isFile())
      .map(name => {
        const stat = fs.statSync(path.join(dirPath, name))
        const ext = path.extname(name).slice(1).toLowerCase()
        return {
          name,
          size: stat.size,
          ext,
          path: `${folder}/${name}`,
        }
      })
    return NextResponse.json(files)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const folder = formData.get('folder') as string
    const file = formData.get('file') as File | null

    if (!folder || folder.includes('..')) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
    }
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 6MB limit
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 6MB)' }, { status: 413 })
    }

    const dirPath = path.join(knowledgeDir, folder)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = path.join(dirPath, filename)

    const arrayBuffer = await file.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer))

    return NextResponse.json({
      success: true,
      filename,
      path: `${folder}/${filename}`,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const filePath = request.nextUrl.searchParams.get('path')
    if (!filePath || filePath.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
    const fullPath = path.join(knowledgeDir, filePath)
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    fs.unlinkSync(fullPath)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
