"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Settings, Shield, Bell, Database, Cpu } from "lucide-react"

export default function SettingsDashboard() {
  const [settings, setSettings] = useState({
    systemName: "Advanced Stock Prediction System",
    adminEmail: "admin@stockprediction.com",
    timezone: "UTC",
    language: "en",
    theme: "light",
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure system preferences and security settings</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription>Basic system configuration and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="systemName">System Name</Label>
                      <Input
                        id="systemName"
                        value={settings.systemName}
                        onChange={(e) => setSettings((prev) => ({ ...prev, systemName: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={settings.adminEmail}
                        onChange={(e) => setSettings((prev) => ({ ...prev, adminEmail: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={settings.timezone}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time</SelectItem>
                          <SelectItem value="PST">Pacific Time</SelectItem>
                          <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Backup</Label>
                        <p className="text-sm text-gray-600">Automatically backup system data daily</p>
                      </div>
                      <Switch
                        checked={settings.autoBackup}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoBackup: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-gray-600">Enable maintenance mode for system updates</p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, maintenanceMode: checked }))}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button>Save General Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                  <CardDescription>Configure authentication and security policies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Session Timeout (hours)</Label>
                      <Input type="number" defaultValue="24" className="w-32" />
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Login Attempts</Label>
                      <Input type="number" defaultValue="5" className="w-32" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Require 2FA for admin access</p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>IP Whitelist</Label>
                        <p className="text-sm text-gray-600">Restrict admin access to specific IP addresses</p>
                      </div>
                      <Switch />
                    </div>

                    <div className="space-y-2">
                      <Label>Allowed IP Addresses</Label>
                      <Textarea placeholder="192.168.1.1&#10;10.0.0.1&#10;203.0.113.1" className="h-24" />
                    </div>

                    <div className="pt-4 border-t">
                      <Button>Save Security Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Security</CardTitle>
                  <CardDescription>Configure API access and rate limiting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>API Rate Limiting</Label>
                        <p className="text-sm text-gray-600">Limit API requests per minute</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label>Rate Limit (requests/minute)</Label>
                      <Input type="number" defaultValue="100" className="w-32" />
                    </div>

                    <div className="space-y-2">
                      <Label>API Key Expiration (days)</Label>
                      <Input type="number" defaultValue="365" className="w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>Configure alerts and notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive system alerts via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, smsNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Health Alerts</Label>
                        <p className="text-sm text-gray-600">Notify when system health degrades</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Performance Alerts</Label>
                        <p className="text-sm text-gray-600">Notify when performance thresholds are exceeded</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Security Alerts</Label>
                        <p className="text-sm text-gray-600">Notify of security events and failed logins</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Alert Thresholds</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>High Response Time (ms)</Label>
                        <Input type="number" defaultValue="500" />
                      </div>

                      <div className="space-y-2">
                        <Label>High Error Rate (%)</Label>
                        <Input type="number" defaultValue="5" />
                      </div>

                      <div className="space-y-2">
                        <Label>Low Disk Space (%)</Label>
                        <Input type="number" defaultValue="10" />
                      </div>

                      <div className="space-y-2">
                        <Label>High CPU Usage (%)</Label>
                        <Input type="number" defaultValue="80" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button>Save Notification Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>AI Configuration</span>
                </CardTitle>
                <CardDescription>Configure AI models and analysis parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Primary AI Model</Label>
                    <Select defaultValue="groq-llama">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="groq-llama">Groq Llama 3.1</SelectItem>
                        <SelectItem value="openai-gpt4">OpenAI GPT-4</SelectItem>
                        <SelectItem value="claude-3">Anthropic Claude 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Analysis Confidence Threshold (%)</Label>
                    <Input type="number" defaultValue="75" className="w-32" />
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Analysis Time (seconds)</Label>
                    <Input type="number" defaultValue="30" className="w-32" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Real-time Analysis</Label>
                      <p className="text-sm text-gray-600">Enable continuous AI analysis of market data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sentiment Analysis</Label>
                      <p className="text-sm text-gray-600">Include news sentiment in AI analysis</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Technical Indicators</Label>
                      <p className="text-sm text-gray-600">Include technical analysis in AI recommendations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Custom AI Prompt</Label>
                    <Textarea
                      placeholder="Enter custom instructions for AI analysis..."
                      className="h-24"
                      defaultValue="Analyze the stock data comprehensively, considering technical indicators, fundamental analysis, market sentiment, and recent news. Provide clear buy/sell/hold recommendations with confidence levels."
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button>Save AI Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database Configuration</span>
                </CardTitle>
                <CardDescription>Manage database settings and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Connection Settings</h4>
                      <div className="space-y-2">
                        <Label>Connection Pool Size</Label>
                        <Input type="number" defaultValue="10" className="w-32" />
                      </div>
                      <div className="space-y-2">
                        <Label>Query Timeout (seconds)</Label>
                        <Input type="number" defaultValue="30" className="w-32" />
                      </div>
                      <div className="space-y-2">
                        <Label>Idle Timeout (minutes)</Label>
                        <Input type="number" defaultValue="10" className="w-32" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Performance</h4>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Query Caching</Label>
                          <p className="text-sm text-gray-600">Cache frequent queries</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto Vacuum</Label>
                          <p className="text-sm text-gray-600">Automatic database cleanup</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Backup Settings</h4>
                    <div className="space-y-2">
                      <Label>Backup Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Retention Period (days)</Label>
                      <Input type="number" defaultValue="30" className="w-32" />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button>Save Database Settings</Button>
                      <Button variant="outline">Test Connection</Button>
                      <Button variant="outline">Create Backup</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Maintenance & Updates</span>
                </CardTitle>
                <CardDescription>System maintenance and update management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-yellow-800">Maintenance Mode</h4>
                        <p className="text-sm text-yellow-700">System is currently in maintenance mode</p>
                      </div>
                      <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                        {settings.maintenanceMode ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">System Updates</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Security Update v2.1.3</p>
                          <p className="text-sm text-gray-600">Critical security patches and bug fixes</p>
                        </div>
                        <Button size="sm">Install</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Feature Update v2.2.0</p>
                          <p className="text-sm text-gray-600">New AI analysis features and performance improvements</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Maintenance Schedule</h4>
                    <div className="space-y-2">
                      <Label>Scheduled Maintenance Window</Label>
                      <Select defaultValue="sunday-2am">
                        <SelectTrigger className="w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sunday-2am">Sunday 2:00 AM</SelectItem>
                          <SelectItem value="saturday-3am">Saturday 3:00 AM</SelectItem>
                          <SelectItem value="daily-1am">Daily 1:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-restart after updates</Label>
                        <p className="text-sm text-gray-600">Automatically restart services after updates</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">System Actions</h4>
                    <div className="flex space-x-2">
                      <Button variant="outline">Restart Services</Button>
                      <Button variant="outline">Clear Cache</Button>
                      <Button variant="outline">Export Logs</Button>
                      <Button variant="destructive">Factory Reset</Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button>Save Maintenance Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
