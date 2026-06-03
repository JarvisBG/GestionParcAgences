from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Agence(Base):
    __tablename__ = "agences"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, index=True)
    
    departements = relationship("Departement", back_populates="agence")

class Departement(Base):
    __tablename__ = "departements"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    agence_id = Column(Integer, ForeignKey("agences.id"))
    
    agence = relationship("Agence", back_populates="departements")
    postes = relationship("Poste", back_populates="departement")

class Poste(Base):
    __tablename__ = "postes"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String)
    departement_id = Column(Integer, ForeignKey("departements.id"))
    
    departement = relationship("Departement", back_populates="postes")
    employe = relationship("Employe", back_populates="poste", uselist=False)

class Employe(Base):
    __tablename__ = "employes"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    prenom = Column(String)
    matricule = Column(String, unique=True)
    telephone = Column(String)
    email = Column(String)
    statut = Column(String, default="Actif")
    poste_id = Column(Integer, ForeignKey("postes.id"), nullable=True)
    
    poste = relationship("Poste", back_populates="employe")

class Equipement(Base):
    __tablename__ = "equipements"
    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True)
    numero_serie = Column(String, unique=True)
    marque = Column(String)
    modele = Column(String)
    categorie = Column(String) 
    etat = Column(String, default="Neuf") 
    statut = Column(String, default="En stock") 
    
    # Relations vers l'historique et les pannes
    mouvements = relationship("Mouvement", back_populates="equipement")
    incidents = relationship("Incident", back_populates="equipement")

# --- LES NOUVELLES TABLES ---

class Mouvement(Base):
    __tablename__ = "mouvements"
    id = Column(Integer, primary_key=True, index=True)
    equipement_id = Column(Integer, ForeignKey("equipements.id"))
    date_mouvement = Column(DateTime, default=datetime.utcnow)
    origine = Column(String) # ex: "Inventaire initial", "Agence A", "Poste Caissier 1"
    destination = Column(String) # ex: "Poste Caissier 1", "Douala (Maintenance)"
    motif = Column(String) # ex: "Affectation", "Envoi pour réparation", "Création"
    utilisateur = Column(String) # L'admin qui a fait l'action
    
    equipement = relationship("Equipement", back_populates="mouvements")

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    equipement_id = Column(Integer, ForeignKey("equipements.id"))
    date_panne = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)
    niveau_criticite = Column(String) # Faible, Moyen, Critique
    date_resolution = Column(DateTime, nullable=True)
    statut = Column(String, default="En cours") # En cours, Résolu
    
    equipement = relationship("Equipement", back_populates="incidents")