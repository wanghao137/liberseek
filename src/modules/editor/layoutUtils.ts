import type { WorkshopProject } from '../project/project'

export function autoLayout(project: WorkshopProject): WorkshopProject {
  const leaves = [...project.leaves]
  
  // Sort leaves by asset ID to maintain order
  const leavesWithAssets = leaves.filter(l => l.assetId)
  
  // Reassign assets in order
  const updatedLeaves = leaves.map((leaf, index) => {
    if (index < leavesWithAssets.length) {
      return { ...leaf, assetId: leavesWithAssets[index].assetId }
    }
    return leaf
  })

  return {
    ...project,
    leaves: updatedLeaves,
    updatedAt: new Date().toISOString(),
  }
}

export function reverseOrder(project: WorkshopProject): WorkshopProject {
  const leaves = [...project.leaves]
  const assets = leaves.map(l => l.assetId).reverse()
  
  const updatedLeaves = leaves.map((leaf, index) => ({
    ...leaf,
    assetId: assets[index] || null,
  }))

  return {
    ...project,
    leaves: updatedLeaves,
    updatedAt: new Date().toISOString(),
  }
}

export function shuffleLeaves(project: WorkshopProject): WorkshopProject {
  const leaves = [...project.leaves]
  const assets = leaves.map(l => l.assetId)
  
  // Fisher-Yates shuffle
  for (let i = assets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assets[i], assets[j]] = [assets[j], assets[i]]
  }
  
  const updatedLeaves = leaves.map((leaf, index) => ({
    ...leaf,
    assetId: assets[index],
  }))

  return {
    ...project,
    leaves: updatedLeaves,
    updatedAt: new Date().toISOString(),
  }
}
