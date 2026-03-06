import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { User, LogOut, Settings, Shield } from "lucide-react";
import type { User as UserType } from "../types/user";

interface UserAvatarProps {
  user: UserType;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export function UserAvatar({ user, onOpenProfile, onLogout }: UserAvatarProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isAdmin = user.roles.some(role => role.id === 'admin');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-muted-foreground">{user.account.name}</span>
              {isAdmin && (
                <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                  <Shield className="h-2 w-2 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
          <Avatar className="h-8 w-8 shadow-sm border border-border">
            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 shadow-lg" align="end">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <div className="flex flex-wrap gap-1">
              {user.roles.map(role => (
                <Badge key={role.id} variant="secondary" className="text-xs">
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onOpenProfile}>
          <User className="h-4 w-4 mr-2" />
          Profile Settings
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem>
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}