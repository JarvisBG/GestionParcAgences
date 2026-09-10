# ParcManager — inventaire de parc informatique multi-agences

Suivre le matériel informatique d'un réseau d'agences : qui détient quoi, où,
depuis quand, et ce qui est tombé en panne.

API REST en **Python / FastAPI + SQLAlchemy**, interface **React + TypeScript
(Vite, Tailwind)**. Livré aussi en application de bureau autonome, pour un poste
sans serveur à administrer — `run_app.py` démarre l'API et sert l'interface.

## Le modèle

Sept tables liées, en base relationnelle :

| Table | Rôle |
|---|---|
| `agences` | le réseau |
| `departements`, `postes` | l'organisation interne d'une agence |
| `employes` | les détenteurs de matériel |
| `equipements` | le parc lui-même |
| `mouvements` | l'historique des affectations — un équipement garde sa trace |
| `incidents` | les pannes, ouvertes puis résolues |

Deux choix structurants : un équipement n'est jamais « déplacé » en écrasant son
détenteur, on écrit un **mouvement** ; un incident n'est pas supprimé, il est
**résolu** (`PUT /incidents/{id}/resoudre`). L'inventaire garde donc son passé.

## L'API

CRUD complet sur les six premières tables, plus les vues qui servent réellement :

```
GET  /equipements/{id}/mouvements/   historique d'un poste
GET  /equipements/{id}/incidents/    pannes d'un poste
PUT  /incidents/{id}/resoudre        clôture d'un incident
```

Documentation interactive générée par FastAPI sur `/docs`.

## Démarrer

```bash
pip install fastapi uvicorn sqlalchemy pydantic
uvicorn backend.main:app --reload      # API sur :8000, doc sur /docs

cd frontend && npm install && npm run dev
```

Base SQLite par défaut (`parc_informatique.db`), créée au premier lancement.
Le passage à PostgreSQL ne touche qu'une ligne — `SQLALCHEMY_DATABASE_URL`
dans `backend/database.py`.

---

Jarvis MBOUMMEU — jarvismboummeu28@gmail.com
