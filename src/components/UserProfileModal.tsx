import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { User, Mail, Building, Calendar, Shield, Camera, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { User as UserType } from "../types/user";

interface UserProfileModalProps {
  user: UserType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (user: UserType) => void;
}

export function UserProfileModal({ user, open, onOpenChange, onUpdateUser }: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSave = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="default" className="shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            View and manage your profile information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 shadow-sm border border-border">
                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-8 w-8 p-0 rounded-full"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.roles.map(role => (
                      <Badge key={role.id} variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editedUser.firstName}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  ) : (
                    <div className="p-2 text-sm">{user.firstName}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editedUser.lastName}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  ) : (
                    <div className="p-2 text-sm">{user.lastName}</div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>Your organization and role details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Organization</Label>
                  <div className="flex items-center gap-2 p-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {user.account.name}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Domain</Label>
                  <div className="p-2 text-sm">{user.account.domain}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <div className="flex items-center gap-2 p-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Login</Label>
                  <div className="p-2 text-sm text-muted-foreground">
                    {new Date(user.lastLoginAt).toLocaleDateString()} at {new Date(user.lastLoginAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Permissions</CardTitle>
              <CardDescription>Your current role permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.roles.map((role) => (
                  <div key={role.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium">{role.name}</span>
                      <Badge variant="outline" className="text-xs">{role.id}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(permission => (
                        <Badge key={permission.id} variant="outline" className="text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                    </div>
                    {role !== user.roles[user.roles.length - 1] && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
