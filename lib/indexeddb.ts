interface VideoMoment {
  id: string
  videoId: string
  timestamp: number
  title: string
  note: string
  tags: string[]
  createdAt: string
  folderId: string
}

interface VideoNote {
  id: string
  videoId: string
  content: string
  timestamp?: number
  createdAt: string
  updatedAt: string
  folderId: string
}

interface SavedVideo {
  id: string
  videoId: string
  title: string
  thumbnail: string
  channelTitle: string
  duration: string
  url: string
  folderId: string
  savedAt: string
  lastWatched?: string
  watchProgress?: number
  viewCount?: string
  publishedAt?: string
}

interface Folder {
  id: string
  name: string
  color: string
  icon: string
  parentId?: string
  createdAt: string
  isSystem?: boolean
}

class VidoDatabase {
  private db: IDBDatabase | null = null
  private readonly dbName = "VidoStudyDB"
  private readonly version = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create folders store
        if (!db.objectStoreNames.contains("folders")) {
          const foldersStore = db.createObjectStore("folders", { keyPath: "id" })
          foldersStore.createIndex("parentId", "parentId", { unique: false })
        }

        // Create saved videos store
        if (!db.objectStoreNames.contains("savedVideos")) {
          const videosStore = db.createObjectStore("savedVideos", { keyPath: "id" })
          videosStore.createIndex("folderId", "folderId", { unique: false })
          videosStore.createIndex("videoId", "videoId", { unique: false })
        }

        // Create video moments store
        if (!db.objectStoreNames.contains("videoMoments")) {
          const momentsStore = db.createObjectStore("videoMoments", { keyPath: "id" })
          momentsStore.createIndex("videoId", "videoId", { unique: false })
          momentsStore.createIndex("folderId", "folderId", { unique: false })
        }

        // Create video notes store
        if (!db.objectStoreNames.contains("videoNotes")) {
          const notesStore = db.createObjectStore("videoNotes", { keyPath: "id" })
          notesStore.createIndex("videoId", "videoId", { unique: false })
          notesStore.createIndex("folderId", "folderId", { unique: false })
        }
      }
    })
  }

  // Folder operations
  async createFolder(folder: Omit<Folder, "id" | "createdAt">): Promise<string> {
    const id = crypto.randomUUID()
    const newFolder: Folder = {
      ...folder,
      id,
      createdAt: new Date().toISOString(),
    }

    const transaction = this.db!.transaction(["folders"], "readwrite")
    const store = transaction.objectStore("folders")
    await store.add(newFolder)

    return id
  }

  async getFolders(): Promise<Folder[]> {
    const transaction = this.db!.transaction(["folders"], "readonly")
    const store = transaction.objectStore("folders")
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<void> {
    const transaction = this.db!.transaction(["folders"], "readwrite")
    const store = transaction.objectStore("folders")
    const folder = await store.get(id)

    if (folder) {
      const updatedFolder = { ...folder, ...updates }
      await store.put(updatedFolder)
    }
  }

  async deleteFolder(id: string): Promise<void> {
    const transaction = this.db!.transaction(["folders"], "readwrite")
    const store = transaction.objectStore("folders")
    await store.delete(id)
  }

  // Video operations
  async saveVideo(video: Omit<SavedVideo, "id" | "savedAt">): Promise<string> {
    const id = crypto.randomUUID()
    const newVideo: SavedVideo = {
      ...video,
      id,
      savedAt: new Date().toISOString(),
    }

    const transaction = this.db!.transaction(["savedVideos"], "readwrite")
    const store = transaction.objectStore("savedVideos")
    await store.add(newVideo)

    return id
  }

  async getVideosByFolder(folderId: string): Promise<SavedVideo[]> {
    const transaction = this.db!.transaction(["savedVideos"], "readonly")
    const store = transaction.objectStore("savedVideos")
    const index = store.index("folderId")
    const request = index.getAll(folderId)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllVideos(): Promise<SavedVideo[]> {
    const transaction = this.db!.transaction(["savedVideos"], "readonly")
    const store = transaction.objectStore("savedVideos")
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteVideo(id: string): Promise<void> {
    const transaction = this.db!.transaction(["savedVideos"], "readwrite")
    const store = transaction.objectStore("savedVideos")
    await store.delete(id)
  }

  async updateVideoProgress(videoId: string, progress: number): Promise<void> {
    const transaction = this.db!.transaction(["savedVideos"], "readwrite")
    const store = transaction.objectStore("savedVideos")
    const index = store.index("videoId")
    const request = index.get(videoId)

    request.onsuccess = async () => {
      const video = request.result
      if (video) {
        video.watchProgress = progress
        video.lastWatched = new Date().toISOString()
        await store.put(video)
      }
    }
  }

  // Moment operations
  async saveMoment(moment: Omit<VideoMoment, "id" | "createdAt">): Promise<string> {
    const id = crypto.randomUUID()
    const newMoment: VideoMoment = {
      ...moment,
      id,
      createdAt: new Date().toISOString(),
    }

    const transaction = this.db!.transaction(["videoMoments"], "readwrite")
    const store = transaction.objectStore("videoMoments")
    await store.add(newMoment)

    return id
  }

  async getMomentsByVideo(videoId: string): Promise<VideoMoment[]> {
    const transaction = this.db!.transaction(["videoMoments"], "readonly")
    const store = transaction.objectStore("videoMoments")
    const index = store.index("videoId")
    const request = index.getAll(videoId)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result.sort((a, b) => a.timestamp - b.timestamp))
      request.onerror = () => reject(request.error)
    })
  }

  async getAllMoments(): Promise<VideoMoment[]> {
    const transaction = this.db!.transaction(["videoMoments"], "readonly")
    const store = transaction.objectStore("videoMoments")
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Note operations
  async saveNote(note: Omit<VideoNote, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const id = crypto.randomUUID()
    const newNote: VideoNote = {
      ...note,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const transaction = this.db!.transaction(["videoNotes"], "readwrite")
    const store = transaction.objectStore("videoNotes")
    await store.add(newNote)

    return id
  }

  async getNotesByVideo(videoId: string): Promise<VideoNote[]> {
    const transaction = this.db!.transaction(["videoNotes"], "readonly")
    const store = transaction.objectStore("videoNotes")
    const index = store.index("videoId")
    const request = index.getAll(videoId)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllNotes(): Promise<VideoNote[]> {
    const transaction = this.db!.transaction(["videoNotes"], "readonly")
    const store = transaction.objectStore("videoNotes")
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateNote(id: string, content: string): Promise<void> {
    const transaction = this.db!.transaction(["videoNotes"], "readwrite")
    const store = transaction.objectStore("videoNotes")
    const note = await store.get(id)

    if (note) {
      note.content = content
      note.updatedAt = new Date().toISOString()
      await store.put(note)
    }
  }

  async deleteNote(id: string): Promise<void> {
    const transaction = this.db!.transaction(["videoNotes"], "readwrite")
    const store = transaction.objectStore("videoNotes")
    await store.delete(id)
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    const transaction = this.db!.transaction(["folders", "savedVideos", "videoMoments", "videoNotes"], "readwrite")

    await Promise.all([
      transaction.objectStore("folders").clear(),
      transaction.objectStore("savedVideos").clear(),
      transaction.objectStore("videoMoments").clear(),
      transaction.objectStore("videoNotes").clear(),
    ])
  }
}

export const vidoDB = new VidoDatabase()
