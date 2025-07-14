"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Shield, Settings } from "lucide-react";
import { getRolesClient, updateUserRoleClient, ClientRole, UserWithRole } from "@/lib/roles-client";

interface RoleManagementProps {
  users: UserWithRole[];
  onUserRoleUpdated?: (userId: string, newRole: ClientRole) => void;
}

export function RoleManagement({ users, onUserRoleUpdated }: RoleManagementProps) {
  const [roles, setRoles] = useState<ClientRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const rolesData = await getRolesClient();
      setRoles(rolesData);
    } catch (error) {
      console.error("Erreur lors du chargement des rôles:", error);
      toast.error("Impossible de charger les rôles");
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || !selectedRoleId) return;

    setIsLoading(true);
    try {
      const updatedUser = await updateUserRoleClient(selectedUser.id, selectedRoleId);
      
      toast.success("Rôle mis à jour avec succès");
      
      // Notifier le parent du changement
      if (onUserRoleUpdated && updatedUser.role) {
        onUserRoleUpdated(selectedUser.id, updatedUser.role);
      }
      
      setIsDialogOpen(false);
      setSelectedUser(null);
      setSelectedRoleId("");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role?.id || "");
    setIsDialogOpen(true);
  };

  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      "admin": "bg-red-100 text-red-800",
      "station-manager": "bg-blue-100 text-blue-800",
      "mechanic": "bg-green-100 text-green-800"
    };
    return colors[roleName] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Rôles Utilisateurs
          </CardTitle>
          <CardDescription>
            Gérez les rôles et permissions des utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun utilisateur à afficher
              </div>
            ) : (
              users.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {user.role ? (
                      <Badge className={getRoleColor(user.role.name)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Aucun rôle
                      </Badge>
                    )}
                    
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDialog(user)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier le rôle de {selectedUser?.name}</DialogTitle>
                          <DialogDescription>
                            Sélectionnez un nouveau rôle pour cet utilisateur
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Rôle actuel</label>
                            <p className="text-muted-foreground">
                              {selectedUser?.role?.name || "Aucun rôle assigné"}
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Nouveau rôle</label>
                            <Select 
                              value={selectedRoleId} 
                              onValueChange={setSelectedRoleId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un rôle" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getRoleColor(role.name)}>
                                        {role.name}
                                      </Badge>
                                      <span>{role.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isLoading}
                          >
                            Annuler
                          </Button>
                          <Button 
                            onClick={handleRoleUpdate}
                            disabled={isLoading || !selectedRoleId}
                          >
                            {isLoading ? "Mise à jour..." : "Mettre à jour"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
