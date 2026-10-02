"""Données de démonstration fictives, chargées au démarrage si la base est vide (variable SEED_DEMO=1)."""
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
from backend import models
from backend.database import SessionLocal

AGENCES = {
    "Agence Douala Akwa": {
        "Informatique": ["Responsable IT", "Technicien Support"],
        "Comptabilité": ["Chef Comptable", "Comptable"],
        "Accueil": ["Chargé d'accueil"],
    },
    "Agence Yaoundé Centre": {
        "Direction": ["Directeur d'agence", "Assistant de direction"],
        "Opérations": ["Chargé de programme", "Agent terrain"],
    },
    "Agence Bafoussam": {
        "Opérations": ["Coordinateur terrain"],
        "Logistique": ["Logisticien"],
    },
}

EMPLOYES = [
    ("NGUEMA", "Paul", "+237 690 11 22 33"),
    ("MBARGA", "Claire", "+237 677 45 12 09"),
    ("FOTSO", "Jean", "+237 655 30 88 14"),
    ("ESSOMBA", "Marie", "+237 699 02 41 76"),
    ("TCHOUA", "Didier", "+237 670 58 23 90"),
    ("ATANGANA", "Sandrine", "+237 691 77 64 21"),
    ("KAMGA", "Eric", "+237 678 19 50 33"),
    ("NJOYA", "Aïcha", "+237 656 84 07 12"),
    ("BELLA", "Roger", "+237 694 26 39 58"),
    ("MOUKOKO", "Brigitte", "+237 675 91 13 47"),
]

EQUIPEMENTS = [
    ("Ordinateur Portable", "Dell", "Latitude 5440"),
    ("Ordinateur Portable", "HP", "EliteBook 840 G10"),
    ("Ordinateur Portable", "Lenovo", "ThinkPad T14"),
    ("Unité Centrale", "HP", "ProDesk 400 G9"),
    ("Unité Centrale", "Dell", "OptiPlex 7010"),
    ("Écran", "Dell", "P2423H"),
    ("Écran", "HP", "E24 G5"),
    ("Écran", "Samsung", "S24C310"),
    ("Imprimante", "HP", "LaserJet Pro M404dn"),
    ("Imprimante", "Canon", "i-SENSYS MF453dw"),
    ("Téléphone IP", "Yealink", "T43U"),
    ("Téléphone IP", "Cisco", "CP-7841"),
    ("Switch / Routeur", "Cisco", "Catalyst 1000-24T"),
    ("Switch / Routeur", "MikroTik", "hEX RB750Gr3"),
    ("Onduleur", "APC", "Back-UPS 1200"),
    ("Onduleur", "Eaton", "5E 1100i"),
    ("Clavier", "Logitech", "K120"),
    ("Souris", "Logitech", "M90"),
    ("Clé USB", "SanDisk", "Ultra 64 Go"),
    ("Câble Réseau", "Generic", "RJ45 Cat6 3m"),
]


def seed_demo():
    db = SessionLocal()
    try:
        if db.query(models.Agence).first():
            return

        postes = []
        for nom_agence, depts in AGENCES.items():
            agence = models.Agence(nom=nom_agence)
            db.add(agence)
            db.flush()
            for nom_dept, titres in depts.items():
                dept = models.Departement(nom=nom_dept, agence_id=agence.id)
                db.add(dept)
                db.flush()
                for titre in titres:
                    poste = models.Poste(titre=titre, departement_id=dept.id)
                    db.add(poste)
                    db.flush()
                    postes.append(poste)

        employes = []
        for i, (nom, prenom, tel) in enumerate(EMPLOYES):
            emp = models.Employe(
                nom=nom, prenom=prenom, matricule=f"EMP-{1001 + i}", telephone=tel,
                email=f"{prenom.lower().replace('ï', 'i')}.{nom.lower()}@demo.org",
                statut="Actif", poste_id=postes[i].id if i < len(postes) else None,
            )
            db.add(emp)
            employes.append(emp)
        db.flush()

        now = datetime.utcnow()
        equipements = []
        for i, (cat, marque, modele) in enumerate(EQUIPEMENTS):
            eq = models.Equipement(
                reference=f"EQ-{2024 + i // 10}-{i + 1:03d}", numero_serie=f"SN{marque[:3].upper()}{48210 + i * 37}",
                marque=marque, modele=modele, categorie=cat, etat="Neuf", statut="En stock",
            )
            db.add(eq)
            db.flush()
            db.add(models.Mouvement(
                equipement_id=eq.id, date_mouvement=now - timedelta(days=90 - i),
                origine="Fournisseur", destination="Stock Agence", motif="Création", utilisateur="Admin",
            ))
            equipements.append(eq)

        # Affectations aux employés (destination = "NOM Prénom", comme dans l'interface)
        for i, emp in enumerate(employes):
            eq = equipements[i]
            eq.statut, eq.etat = "Affecté", "Bon"
            db.add(models.Mouvement(
                equipement_id=eq.id, date_mouvement=now - timedelta(days=40 - i),
                origine="Stock Agence", destination=f"{emp.nom} {emp.prenom}", motif="Affectation", utilisateur="Admin",
            ))

        # Un équipement envoyé en réparation, un mis au rebut
        rep, rebut = equipements[10], equipements[11]
        rep.statut, rep.etat = "En réparation externe", "Défectueux"
        db.add(models.Mouvement(
            equipement_id=rep.id, date_mouvement=now - timedelta(days=5),
            origine="Stock Agence", destination="Centre de Réparation (Douala)", motif="Envoi pour réparation", utilisateur="Admin",
        ))
        rebut.statut, rebut.etat = "Mis au rebut", "Défectueux"
        db.add(models.Mouvement(
            equipement_id=rebut.id, date_mouvement=now - timedelta(days=3),
            origine="Stock Agence", destination="Mise au rebut", motif="Fin de vie", utilisateur="Admin",
        ))

        # Incidents (un critique en cours => équipement en panne)
        equipements[12].statut = "En panne"
        db.add_all([
            models.Incident(equipement_id=equipements[12].id, date_panne=now - timedelta(days=1),
                            description="Switch hors service, plus d'accès réseau au 1er étage.", niveau_criticite="Critique"),
            models.Incident(equipement_id=equipements[1].id, date_panne=now - timedelta(days=4),
                            description="Batterie qui se décharge rapidement.", niveau_criticite="Moyen"),
            models.Incident(equipement_id=equipements[8].id, date_panne=now - timedelta(days=12),
                            description="Bourrage papier récurrent.", niveau_criticite="Faible",
                            statut="Résolu", date_resolution=now - timedelta(days=10)),
        ])

        db.commit()
    except IntegrityError:
        # Une autre instance a chargé les données au même moment
        db.rollback()
    finally:
        db.close()
