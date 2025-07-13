import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  GripVertical,
  Type,
  Mail,
  Phone,
  Calendar,
  Hash,
  CheckSquare,
  List,
  FileText
} from 'lucide-react'

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea' | 'number' | 'date'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  order: number
}

interface EventFormBuilderProps {
  eventId: string
  initialForm?: {
    id?: string
    title: string
    description?: string
    fields: FormField[]
  }
  onSave: (formData: any) => void
  onCancel: () => void
}

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'textarea', label: 'Text Area', icon: FileText }
]

export const EventFormBuilder: React.FC<EventFormBuilderProps> = ({
  eventId,
  initialForm,
  onSave,
  onCancel
}) => {
  const [formTitle, setFormTitle] = useState(initialForm?.title || '')
  const [formDescription, setFormDescription] = useState(initialForm?.description || '')
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || [])
  const [editingField, setEditingField] = useState<string | null>(null)
  const [showAddField, setShowAddField] = useState(false)

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: '',
      required: false,
      order: fields.length,
      ...(type === 'select' && { options: ['Option 1', 'Option 2'] })
    }
    setFields([...fields, newField])
    setEditingField(newField.id)
    setShowAddField(false)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId))
    setEditingField(null)
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(field => field.id === fieldId)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === fields.length - 1)
    ) {
      return
    }

    const newFields = [...fields]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    // Swap fields
    [newFields[currentIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[currentIndex]]
    
    // Update order
    newFields.forEach((field, index) => {
      field.order = index
    })
    
    setFields(newFields)
  }

  const handleSave = () => {
    if (!formTitle.trim()) {
      alert('Form title is required')
      return
    }

    if (fields.length === 0) {
      alert('At least one field is required')
      return
    }

    const formData = {
      ...(initialForm?.id && { id: initialForm.id }),
      title: formTitle.trim(),
      description: formDescription.trim(),
      fields: fields.map((field, index) => ({ ...field, order: index }))
    }

    onSave(formData)
  }

  const renderFieldEditor = (field: FormField) => {
    const isEditing = editingField === field.id

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            <div>
              <div className="text-white font-medium">{field.label}</div>
              <div className="text-sm text-gray-400">
                {fieldTypes.find(t => t.value === field.type)?.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, 'up')}
              disabled={field.order === 0}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveField(field.id, 'down')}
              disabled={field.order === fields.length - 1}
            >
              ↓
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingField(field.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeField(field.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="p-4 bg-gray-800/50 rounded-lg border border-cyan-400/50">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Field Label *
              </label>
              <Input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                placeholder="Enter field label"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Placeholder
              </label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                placeholder="Enter placeholder text"
              />
            </div>
          </div>

          {field.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Options (one per line)
              </label>
              <textarea
                value={field.options?.join('\n') || ''}
                onChange={(e) => updateField(field.id, { 
                  options: e.target.value.split('\n').filter(opt => opt.trim()) 
                })}
                className="w-full h-24 px-4 py-3 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 resize-none"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="rounded border-gray-600 bg-gray-800 text-cyan-400 focus:ring-cyan-400"
              />
              <span className="text-sm text-gray-300">Required field</span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="cyan"
              size="sm"
              onClick={() => setEditingField(null)}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingField(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Settings */}
      <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber">
        <h3 className="text-xl font-bold text-white mb-4">Form Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Form Title *
            </label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full h-24 px-4 py-3 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 resize-none"
              placeholder="Enter form description (optional)"
            />
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Form Fields</h3>
          <Button
            variant="gradient"
            onClick={() => setShowAddField(true)}
          >
            <Plus className="h-4 w-4" />
            Add Field
          </Button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {fields.map((field) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderFieldEditor(field)}
              </motion.div>
            ))}
          </AnimatePresence>

          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No fields added yet. Click "Add Field" to get started.
            </div>
          )}
        </div>

        {/* Add Field Modal */}
        <AnimatePresence>
          {showAddField && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowAddField(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Add Form Field</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddField(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {fieldTypes.map((fieldType) => {
                    const Icon = fieldType.icon
                    return (
                      <Button
                        key={fieldType.value}
                        variant="outline"
                        className="h-20 flex-col gap-2"
                        onClick={() => addField(fieldType.value as FormField['type'])}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs">{fieldType.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="gradient" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Form
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default EventFormBuilder