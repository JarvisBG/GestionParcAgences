from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import models, schemas
from database import engine, SessionLocal

# Création des tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestion Parc Multi-Agences API")

# ==========================================
# CONFIGURATION CORS (LE PONT DE SÉCURITÉ)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Autorise uniquement ton frontend React
    allow_credentials=True,
    allow_methods=["*"], # Autorise toutes les actions (GET, POST, etc.)
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Super ! L'API du parc informatique est en ligne."}

# ==========================================
# ROUTES POUR LES AGENCES
# ==========================================
@app.post("/agences/", response_model=schemas.Agence)
def create_agence(agence: schemas.AgenceCreate, db: Session = Depends(get_db)):
    db_agence = db.query(models.Agence).filter(models.Agence.nom == agence.nom).first()
    if db_agence:
        raise HTTPException(status_code=400, detail="Cette agence existe déjà.")
    nouvelle_agence = models.Agence(nom=agence.nom)
    db.add(nouvelle_agence)
    db.commit()
    db.refresh(nouvelle_agence)
    return nouvelle_agence

@app.get("/agences/", response_model=list[schemas.Agence])
def get_agences(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Agence).offset(skip).limit(limit).all()

# ==========================================
# ROUTES POUR LES DÉPARTEMENTS
# ==========================================
@app.post("/departements/", response_model=schemas.Departement)
def create_departement(departement: schemas.DepartementCreate, db: Session = Depends(get_db)):
    db_agence = db.query(models.Agence).filter(models.Agence.id == departement.agence_id).first()
    if not db_agence:
        raise HTTPException(status_code=404, detail="L'agence n'existe pas.")
    nouveau_dept = models.Departement(nom=departement.nom, agence_id=departement.agence_id)
    db.add(nouveau_dept)
    db.commit()
    db.refresh(nouveau_dept)
    return nouveau_dept

@app.get("/departements/", response_model=list[schemas.Departement])
def get_departements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Departement).offset(skip).limit(limit).all()

# ==========================================
# ROUTES POUR LES POSTES
# ==========================================
@app.post("/postes/", response_model=schemas.Poste)
def create_poste(poste: schemas.PosteCreate, db: Session = Depends(get_db)):
    db_dept = db.query(models.Departement).filter(models.Departement.id == poste.departement_id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Le département n'existe pas.")
    nouveau_poste = models.Poste(titre=poste.titre, departement_id=poste.departement_id)
    db.add(nouveau_poste)
    db.commit()
    db.refresh(nouveau_poste)
    return nouveau_poste

@app.get("/postes/", response_model=list[schemas.Poste])
def get_postes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Poste).offset(skip).limit(limit).all()

# ==========================================
# ROUTES POUR LES EMPLOYÉS
# ==========================================
@app.post("/employes/", response_model=schemas.Employe)
def create_employe(employe: schemas.EmployeCreate, db: Session = Depends(get_db)):
    db_employe = db.query(models.Employe).filter(models.Employe.matricule == employe.matricule).first()
    if db_employe:
        raise HTTPException(status_code=400, detail="Ce matricule existe déjà.")
    nouvel_employe = models.Employe(**employe.dict())
    db.add(nouvel_employe)
    db.commit()
    db.refresh(nouvel_employe)
    return nouvel_employe

@app.get("/employes/", response_model=list[schemas.Employe])
def get_employes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Employe).offset(skip).limit(limit).all()

# ==========================================
# ROUTES POUR LES ÉQUIPEMENTS ET MOUVEMENTS
# ==========================================
@app.post("/equipements/", response_model=schemas.Equipement)
def create_equipement_avec_inventaire(equipement: schemas.EquipementCreate, utilisateur: str = "Admin", db: Session = Depends(get_db)):
    db_equip = db.query(models.Equipement).filter(models.Equipement.numero_serie == equipement.numero_serie).first()
    if db_equip:
        raise HTTPException(status_code=400, detail="Ce numéro de série existe déjà.")
    
    nouvel_equipement = models.Equipement(**equipement.dict())
    db.add(nouvel_equipement)
    db.commit() 
    db.refresh(nouvel_equipement)
    
    mouvement_initial = models.Mouvement(
        equipement_id=nouvel_equipement.id,
        origine="Inconnu / Déjà sur place",
        destination="Stock Agence",
        motif="Inventaire initial",
        utilisateur=utilisateur
    )
    db.add(mouvement_initial)
    db.commit()
    return nouvel_equipement

@app.get("/equipements/", response_model=list[schemas.Equipement])
def get_equipements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Equipement).offset(skip).limit(limit).all()

@app.post("/mouvements/", response_model=schemas.Mouvement)
def create_mouvement(mouvement: schemas.MouvementCreate, db: Session = Depends(get_db)):
    equipement = db.query(models.Equipement).filter(models.Equipement.id == mouvement.equipement_id).first()
    if not equipement:
        raise HTTPException(status_code=404, detail="Équipement non trouvé.")
        
    destination_lower = mouvement.destination.lower()
    if "douala" in destination_lower or "réparation" in mouvement.motif.lower():
        equipement.statut = "En réparation externe"
    elif "stock" in destination_lower:
        equipement.statut = "En stock"
    else:
        equipement.statut = "Affecté"
        
    nouveau_mouvement = models.Mouvement(**mouvement.dict())
    db.add(nouveau_mouvement)
    db.commit()
    db.refresh(nouveau_mouvement)
    return nouveau_mouvement

@app.get("/equipements/{equipement_id}/mouvements/", response_model=list[schemas.Mouvement])
def get_historique_equipement(equipement_id: int, db: Session = Depends(get_db)):
    return db.query(models.Mouvement).filter(models.Mouvement.equipement_id == equipement_id).all()

# ==========================================
# ROUTES POUR LES INCIDENTS (PANNES)
# ==========================================
@app.post("/incidents/", response_model=schemas.Incident)
def create_incident(incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    equipement = db.query(models.Equipement).filter(models.Equipement.id == incident.equipement_id).first()
    if not equipement:
        raise HTTPException(status_code=404, detail="Équipement non trouvé.")
    equipement.statut = "En panne"
    nouvel_incident = models.Incident(**incident.dict())
    db.add(nouvel_incident)
    db.commit()
    db.refresh(nouvel_incident)
    return nouvel_incident

@app.put("/incidents/{incident_id}/resoudre", response_model=schemas.Incident)
def resoudre_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident non trouvé.")
    if incident.statut == "Résolu":
        raise HTTPException(status_code=400, detail="Cet incident est déjà résolu.")
        
    incident.statut = "Résolu"
    incident.date_resolution = datetime.utcnow()
    
    equipement = db.query(models.Equipement).filter(models.Equipement.id == incident.equipement_id).first()
    if equipement:
        equipement.statut = "En stock"
        
    db.commit()
    db.refresh(incident)
    return incident

@app.get("/equipements/{equipement_id}/incidents/", response_model=list[schemas.Incident])
def get_incidents_equipement(equipement_id: int, db: Session = Depends(get_db)):
    return db.query(models.Incident).filter(models.Incident.equipement_id == equipement_id).all()


# ==========================================
# ROUTES DE MODIFICATION ET SUPPRESSION (CRUD COMPLET)
# ==========================================

@app.put("/agences/{agence_id}")
def update_agence(agence_id: int, agence: schemas.AgenceCreate, db: Session = Depends(get_db)):
    db_agence = db.query(models.Agence).filter(models.Agence.id == agence_id).first()
    if not db_agence: raise HTTPException(status_code=404, detail="Agence non trouvée")
    db_agence.nom = agence.nom
    db.commit()
    return db_agence

@app.delete("/agences/{agence_id}")
def delete_agence(agence_id: int, db: Session = Depends(get_db)):
    # SÉCURITÉ : Vérifier si l'agence contient des départements
    if db.query(models.Departement).filter(models.Departement.agence_id == agence_id).first():
        raise HTTPException(status_code=400, detail="Videz d'abord les départements de cette agence.")
    db_agence = db.query(models.Agence).filter(models.Agence.id == agence_id).first()
    db.delete(db_agence)
    db.commit()
    return {"message": "Agence supprimée"}

@app.put("/departements/{dept_id}")
def update_departement(dept_id: int, dept: schemas.DepartementCreate, db: Session = Depends(get_db)):
    db_dept = db.query(models.Departement).filter(models.Departement.id == dept_id).first()
    db_dept.nom = dept.nom
    db_dept.agence_id = dept.agence_id
    db.commit()
    return db_dept

@app.delete("/departements/{dept_id}")
def delete_departement(dept_id: int, db: Session = Depends(get_db)):
    # SÉCURITÉ : Vérifier si le département contient des postes
    if db.query(models.Poste).filter(models.Poste.departement_id == dept_id).first():
        raise HTTPException(status_code=400, detail="Videz d'abord les postes de ce département.")
    db_dept = db.query(models.Departement).filter(models.Departement.id == dept_id).first()
    db.delete(db_dept)
    db.commit()
    return {"message": "Département supprimé"}

@app.put("/postes/{poste_id}")
def update_poste(poste_id: int, poste: schemas.PosteCreate, db: Session = Depends(get_db)):
    db_poste = db.query(models.Poste).filter(models.Poste.id == poste_id).first()
    db_poste.titre = poste.titre
    db_poste.departement_id = poste.departement_id
    db.commit()
    return db_poste

@app.delete("/postes/{poste_id}")
def delete_poste(poste_id: int, db: Session = Depends(get_db)):
    # SÉCURITÉ : On ne supprime pas un poste si quelqu'un l'occupe !
    if db.query(models.Employe).filter(models.Employe.poste_id == poste_id).first():
        raise HTTPException(status_code=400, detail="Un employé occupe ce poste. Détachez-le d'abord.")
    db_poste = db.query(models.Poste).filter(models.Poste.id == poste_id).first()
    db.delete(db_poste)
    db.commit()
    return {"message": "Poste supprimé"}

# ==========================================
# ROUTES DE MODIFICATION DES EMPLOYÉS
# ==========================================

@app.put("/employes/{employe_id}")
def update_employe(employe_id: int, employe: schemas.EmployeCreate, db: Session = Depends(get_db)):
    db_employe = db.query(models.Employe).filter(models.Employe.id == employe_id).first()
    if not db_employe:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    # RÈGLE MÉTIER : Si l'employé part, on libère automatiquement son poste
    if employe.statut in ["Démissionnaire", "Licencié"]:
        db_employe.poste_id = None
    else:
        db_employe.poste_id = employe.poste_id

    # Mise à jour des autres informations
    db_employe.nom = employe.nom
    db_employe.prenom = employe.prenom
    db_employe.matricule = employe.matricule
    db_employe.telephone = employe.telephone
    db_employe.email = employe.email
    db_employe.statut = employe.statut

    db.commit()
    db.refresh(db_employe)
    return db_employe

@app.delete("/employes/{employe_id}")
def delete_employe(employe_id: int, db: Session = Depends(get_db)):
    db_employe = db.query(models.Employe).filter(models.Employe.id == employe_id).first()
    if not db_employe:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    db.delete(db_employe)
    db.commit()
    return {"message": "Dossier employé supprimé"}