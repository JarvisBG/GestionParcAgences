import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# Création du fichier SQLite local qui stockera tout
# Sur Vercel seul /tmp est accessible en écriture
SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/parc_informatique.db" if os.environ.get("VERCEL") else "sqlite:///./parc_informatique.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()