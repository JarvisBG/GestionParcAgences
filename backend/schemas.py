from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from backend.database import Base

# --- SCHEMAS POUR DEPARTEMENT ---
class DepartementBase(BaseModel):
    nom: str
    agence_id: int

class DepartementCreate(DepartementBase):
    pass

class Departement(DepartementBase):
    id: int

    class Config:
        from_attributes = True  # Permet à Pydantic de lire les données de SQLAlchemy

# --- SCHEMAS POUR AGENCE ---
class AgenceBase(BaseModel):
    nom: str

class AgenceCreate(AgenceBase):
    pass

class Agence(AgenceBase):
    id: int
    departements: List[Departement] = []

    class Config:
        from_attributes = True


# --- SCHEMAS POUR POSTE ---
class PosteBase(BaseModel):
    titre: str
    departement_id: int

class PosteCreate(PosteBase):
    pass

class Poste(PosteBase):
    id: int

    class Config:
        from_attributes = True

# --- SCHEMAS POUR EMPLOYE ---
class EmployeBase(BaseModel):
    nom: str
    prenom: str
    matricule: str
    telephone: str
    email: str
    statut: str = "Actif"

class EmployeCreate(EmployeBase):
    poste_id: Optional[int] = None  # Un employé peut être créé sans poste affecté immédiatement

class Employe(EmployeBase):
    id: int
    poste_id: Optional[int]

    class Config:
        from_attributes = True


# --- SCHEMAS POUR EQUIPEMENT ---
class EquipementBase(BaseModel):
    reference: str
    numero_serie: str
    marque: str
    modele: str
    categorie: str
    etat: str = "Neuf" # Neuf, Bon, Usagé, Défectueux
    statut: str = "En stock" # En stock, Affecté, En réparation externe

class EquipementCreate(EquipementBase):
    pass

class Equipement(EquipementBase):
    id: int

    class Config:
        from_attributes = True

# --- SCHEMAS POUR MOUVEMENT ---
class MouvementBase(BaseModel):
    origine: str
    destination: str
    motif: str
    utilisateur: str

class MouvementCreate(MouvementBase):
    equipement_id: int

class Mouvement(MouvementBase):
    id: int
    equipement_id: int
    date_mouvement: datetime

    class Config:
        from_attributes = True


# --- SCHEMAS POUR INCIDENT ---
class IncidentBase(BaseModel):
    description: str
    niveau_criticite: str # Ex: Faible, Moyen, Critique
    statut: str = "En cours"

class IncidentCreate(IncidentBase):
    equipement_id: int

class Incident(IncidentBase):
    id: int
    equipement_id: int
    date_panne: datetime
    date_resolution: Optional[datetime] = None

    class Config:
        from_attributes = True