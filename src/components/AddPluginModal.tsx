import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { useState } from "react";
import type { Plugin } from "../types/plugin";
import { toast } from "sonner";

interface AddPluginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPlugin: (plugin: Omit<Plugin, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const pluginTypes = [
  { value: "activity", label: "Activity Module" },
  { value: "block", label: "Block" },
  { value: "theme", label: "Theme" },
  { value: "local", label: "Local Plugin" },
  { value: "admin", label: "Admin Tool" },
  { value: "core", label: "Core Component" },
  { value: "other", label: "Other" }
];

export function AddPluginModal({ open, onOpenChange, onAddPlugin }: AddPluginModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    repositoryUrl: "",
    installationPath: "",
    description: "",
    type: "" as Plugin['type'],
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.displayName || !formData.repositoryUrl || !formData.installationPath || !formData.type) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate repository URL format
      try {
        new URL(formData.repositoryUrl);
      } catch {
        toast.error("Please enter a valid repository URL");
        return;
      }

      // Validate installation path format
      if (!formData.installationPath.match(/^[a-zA-Z0-9_/]+$/)) {
        toast.error("Installation path can only contain letters, numbers, underscores, and forward slashes");
        return;
      }

      const newPlugin: Omit<Plugin, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        displayName: formData.displayName.trim(),
        repositoryUrl: formData.repositoryUrl.trim(),
        installationPath: formData.installationPath.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        isActive: formData.isActive,
        createdBy: {
          id: "current-user",
          name: "Admin User",
          email: "admin@moodle.org"
        }
      };

      onAddPlugin(newPlugin);

      // Reset form
      setFormData({
        name: "",
        displayName: "",
        repositoryUrl: "",
        installationPath: "",
        description: "",
        type: "" as Plugin['type'],
        isActive: true
      });

      onOpenChange(false);
      toast.success("Plugin added successfully!");

    } catch (error) {
      toast.error("Failed to add plugin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      displayName: "",
      repositoryUrl: "",
      installationPath: "",
      description: "",
      type: "" as Plugin['type'],
      isActive: true
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="default" className="shadow-2xl">
        <DialogHeader>
          <DialogTitle>Add New Plugin</DialogTitle>
          <DialogDescription>
            Add a new Moodle plugin to the catalog for test environment creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plugin Name */}
            <div className="space-y-2">
              <Label htmlFor="plugin-name">
                Plugin Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="plugin-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., theme_boost_union, mod_bookit"
                required
              />
              <p className="text-xs text-muted-foreground">
                Technical name used in Moodle (will be auto-formatted)
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display-name">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="display-name"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., Quiz Activity, Custom Theme"
                required
              />
              <p className="text-xs text-muted-foreground">
                Human-readable name shown in the interface
              </p>
            </div>
          </div>

          {/* Repository URL */}
          <div className="space-y-2">
            <Label htmlFor="repository-url">
              Repository URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="repository-url"
              type="url"
              value={formData.repositoryUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, repositoryUrl: e.target.value }))}
              placeholder="https://github.com/moodle/moodle.git"
              required
            />
            <p className="text-xs text-muted-foreground">
              Git repository URL where the plugin source code is hosted
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Installation Path */}
            <div className="space-y-2">
              <Label htmlFor="installation-path">
                Installation Path <span className="text-destructive">*</span>
              </Label>
              <Input
                id="installation-path"
                value={formData.installationPath}
                onChange={(e) => setFormData(prev => ({ ...prev, installationPath: e.target.value }))}
                placeholder="e.g., mod/quiz, theme/custom"
                required
              />
              <p className="text-xs text-muted-foreground">
                Path where plugin will be mounted in Moodle
              </p>
            </div>

            {/* Plugin Type */}
            <div className="space-y-2">
              <Label htmlFor="plugin-type">
                Plugin Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Plugin['type'] }))}
                required
              >
                <SelectTrigger id="plugin-type">
                  <SelectValue placeholder="Select plugin type" />
                </SelectTrigger>
                <SelectContent>
                  {pluginTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description of the plugin's functionality..."
              rows={3}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="is-active">
              Active (available for test environment creation)
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              {isSubmitting ? "Adding..." : "Add Plugin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
