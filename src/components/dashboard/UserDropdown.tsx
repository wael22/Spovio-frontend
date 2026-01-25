import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getAssetUrl } from "@/lib/api";

interface UserDropdownProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function UserDropdown({
  user = {
    name: "Thomas Martin",
    email: "thomas@example.com"
  }
}: UserDropdownProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    });
    navigate("/auth");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 gap-2 px-2 hover:bg-primary/10"
        >
          <Avatar className="h-8 w-8 border-2 border-primary/30">
            <AvatarImage src={getAssetUrl(user.avatar || '')} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:block text-sm font-medium max-w-[100px] truncate">
            {user.name.split(" ")[0]}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 glass border-border/50"
      >
        <div className="px-3 py-3 border-b border-border/50">
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        <div className="py-1">
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center cursor-pointer">
              <User className="h-4 w-4 mr-3 text-muted-foreground" />
              Mon Profil
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/credits" className="flex items-center cursor-pointer">
              <CreditCard className="h-4 w-4 mr-3 text-accent" />
              Acheter des crédits
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center cursor-pointer">
              <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
              Paramètres
            </Link>
          </DropdownMenuItem> */}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
