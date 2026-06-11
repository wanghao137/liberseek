export type EmptyStateType =
  | 'empty-project'
  | 'no-front'
  | 'no-back'
  | 'no-leaves'
  | 'missing-leaves'

export function getEmptyStateMessage(type: EmptyStateType): string {
  switch (type) {
    case 'empty-project':
      return '这是一个新项目，让我们开始创作吧'
    case 'no-front':
      return '正面长卷尚未上传'
    case 'no-back':
      return '背面长卷尚未上传'
    case 'no-leaves':
      return '内页叶片尚未添加'
    case 'missing-leaves':
      return '部分叶片素材缺失'
    default:
      return ''
  }
}

export function getEmptyStateHint(type: EmptyStateType): string {
  switch (type) {
    case 'empty-project':
      return '点击上方"上传"按钮添加正面长卷'
    case 'no-front':
      return '点击"上传"按钮添加正面长卷图片'
    case 'no-back':
      return '点击"上传"按钮添加背面长卷图片'
    case 'no-leaves':
      return '点击"批量添加"按钮上传内页叶片'
    case 'missing-leaves':
      return '请为缺失的叶片槽位添加素材'
    default:
      return ''
  }
}

export function getEmptyStateIcon(type: EmptyStateType): string {
  switch (type) {
    case 'empty-project':
      return '📁'
    case 'no-front':
    case 'no-back':
      return '🖼️'
    case 'no-leaves':
    case 'missing-leaves':
      return '📄'
    default:
      return '❓'
  }
}
