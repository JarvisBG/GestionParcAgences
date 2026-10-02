import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool


# En ligne : base PostgreSQL partagée (Neon, fournie par Vercel via DATABASE_URL)
# En local / .exe : fichier SQLite
DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")

if DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1).replace("postgresql://", "postgresql+psycopg://", 1)
    # Fonctions serverless : une connexion par requête, pas de pool à garder ouvert
    engine = create_engine(SQLALCHEMY_DATABASE_URL, poolclass=NullPool)
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./parc_informatique.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
