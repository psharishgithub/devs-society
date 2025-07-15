import { motion } from 'framer-motion'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { 
  Settings,
  Save,
  Download,
  Upload,
  Trash2,
  Shield,
  Database,
  Mail,
  Globe,
  Users,
  Bell,
  Key,
  Server
} from 'lucide-react'

export function AdminSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-techie text-gradient mb-2">System Settings</h1>
        <p className="text-gray-400">Configure DEVS portal settings and preferences</p>
      </div>

      {/* General Settings */}
      <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">General Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Portal Name
              </label>
              <Input defaultValue="DEVS Society Portal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Email
              </label>
              <Input defaultValue="admin@devs-society.com" type="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Portal URL
              </label>
              <Input defaultValue="https://portal.devs-society.com" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization Name
              </label>
              <Input defaultValue="DEVS Technical Society" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Support Email
              </label>
              <Input defaultValue="support@devs-society.com" type="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Theme
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm text-white focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400">
                <option>Dark Theme</option>
                <option>Light Theme</option>
                <option>Auto</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="gradient">
            <Save className="h-4 w-4" />
            Save General Settings
          </Button>
        </div>
      </div>

      {/* User Management Settings */}
      <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">User Management</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Auto-approve registrations</div>
                <div className="text-sm text-gray-400">Automatically approve new user registrations</div>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Email verification required</div>
                <div className="text-sm text-gray-400">Require email verification for new users</div>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Allow self-registration</div>
                <div className="text-sm text-gray-400">Allow users to register themselves</div>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default User Role
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm text-white focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400">
                <option>regular-member</option>
                <option>special-member</option>
                <option>board-member</option>
                <option>core-member</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <Input type="number" defaultValue="60" />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="cyan">
            <Save className="h-4 w-4" />
            Save User Settings
          </Button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">Security & Privacy</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Two-factor authentication</div>
                <div className="text-sm text-gray-400">Require 2FA for admin accounts</div>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Password complexity</div>
                <div className="text-sm text-gray-400">Enforce strong password requirements</div>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Login rate limiting</div>
                <div className="text-sm text-gray-400">Limit login attempts to prevent brute force</div>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                JWT Secret Rotation
              </label>
              <div className="flex gap-2">
                <Input value="**********************" type="password" disabled />
                <Button variant="outline" size="sm">
                  <Key className="h-4 w-4" />
                  Rotate
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup Frequency
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm text-white focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="green">
            <Save className="h-4 w-4" />
            Save Security Settings
          </Button>
        </div>
      </div>

      {/* Data Management */}
      <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-6 w-6 text-orange-400" />
          <h2 className="text-xl font-bold text-white">Data Management</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-24 flex-col">
            <Download className="h-6 w-6 mb-2" />
            Export All Data
            <span className="text-xs text-gray-400">Download complete database backup</span>
          </Button>
          
          <Button variant="outline" className="h-24 flex-col">
            <Upload className="h-6 w-6 mb-2" />
            Import Data
            <span className="text-xs text-gray-400">Upload and restore from backup</span>
          </Button>
          
          <Button variant="outline" className="h-24 flex-col border-red-500/50 text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-6 w-6 mb-2" />
            Clear Cache
            <span className="text-xs text-gray-400">Clear all cached data</span>
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Server className="h-5 w-5" />
            <span className="font-medium">Database Status</span>
          </div>
          <div className="text-sm text-gray-300">
            <div>Last backup: 2 hours ago</div>
            <div>Database size: 245 MB</div>
            <div>Active connections: 12</div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Email notifications</div>
              <div className="text-sm text-gray-400">Send email notifications for important events</div>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">New user registrations</div>
              <div className="text-sm text-gray-400">Notify admins when new users register</div>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Event reminders</div>
              <div className="text-sm text-gray-400">Send event reminders to registered users</div>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">System alerts</div>
              <div className="text-sm text-gray-400">Notify admins of system issues</div>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="green">
            <Save className="h-4 w-4" />
            Save Notification Settings
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 