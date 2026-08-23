import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'
import { StorageEngine } from '../services/localStorage/storageEngine'

beforeEach(() => {
  localStorage.clear()
  StorageEngine.init(true)
})
