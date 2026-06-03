import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  MonitorSmartphone, 
  Users, 
  AlertTriangle,
  Loader2,
  Briefcase,
  Network,
  Plus,
  Pencil,
  Trash2,
  UserPlus, 
  Mail, 
  Phone, 
  IdCard
} from 'lucide-react';
// On conserve l'import manuel infaillible que nous avons validé
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

// ==========================================
// 1. LE COMPOSANT DE MISE EN PAGE (SIDEBAR)
// ==========================================
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-950 text-white flex flex-col shadow-xl">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MonitorSmartphone size={24} className="text-white" />
          </div>
          <span>ParcManager</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link to="/" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive('/')}`}>
            <LayoutDashboard size={20} /> Tableau de bord
          </Link>
          <Link to="/agences" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive('/agences')}`}>
            <Building2 size={20} /> Agences & Postes
          </Link>
          <Link to="/equipements" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive('/equipements')}`}>
            <MonitorSmartphone size={20} /> Équipements
          </Link>
          <Link to="/employes" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive('/employes')}`}>
            <Users size={20} /> Employés
          </Link>
          <Link to="/incidents" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive('/incidents')}`}>
            <AlertTriangle size={20} /> Incidents & Pannes
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};

// ==========================================
// 2. LA PAGE TABLEAU DE BORD (CONNECTÉE À L'API)
// ==========================================
const Dashboard = () => {
  // 1. Déclaration des variables d'état (Mémoire de la page)
  const [stats, setStats] = useState({
    equipements: 0,
    agences: 0,
    postes: 0,
    incidents: 0
  });
  const [loading, setLoading] = useState(true);

  // 2. La fonction qui va chercher les données au démarrage
  useEffect(() => {
    const fetchDonnees = async () => {
      try {
        // On lance 3 requêtes en même temps vers notre API Python
        const [reqEquipements, reqAgences, reqPostes] = await Promise.all([
          fetch('http://localhost:8000/equipements/'),
          fetch('http://localhost:8000/agences/'),
          fetch('http://localhost:8000/postes/')
        ]);

        // On transforme les réponses en données lisibles (JSON)
        const equipements = await reqEquipements.json();
        const agences = await reqAgences.json();
        const postes = await reqPostes.json();

        // On compte les incidents (tous les équipements qui ont le statut "En panne")
        const compteIncidents = equipements.filter((eq: any) => eq.statut === "En panne").length;

        // On met à jour notre page avec les vrais chiffres
        setStats({
          equipements: equipements.length,
          agences: agences.length,
          postes: postes.length,
          incidents: compteIncidents
        });
        
        setLoading(false); // Fin du chargement
      } catch (error) {
        console.error("Erreur de connexion à l'API:", error);
        setLoading(false);
      }
    };

    fetchDonnees();
  }, []); // Le tableau vide [] signifie qu'on fait ça 1 seule fois au chargement de la page

  // Si on est en train de chercher les données, on affiche un cercle qui tourne
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p>Connexion à la base de données SQLite en cours...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Données en temps réel de votre parc informatique.</p>
      </div>
      
      {/* Les 4 cartes avec les VRAIES données et de grosses icônes colorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Équipements</CardTitle>
            <div className="bg-blue-100 p-2 rounded-full">
              <MonitorSmartphone className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{stats.equipements}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Enregistrés dans le système</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Agences</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-full">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{stats.agences}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Connectées au réseau</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Postes de travail</CardTitle>
            <div className="bg-amber-100 p-2 rounded-full">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{stats.postes}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Créés dans les départements</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-200 bg-red-50 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-red-700 uppercase tracking-wider">Équipements en Panne</CardTitle>
            <div className="bg-red-200 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-red-700">{stats.incidents}</div>
            <p className="text-xs text-red-600 mt-2 font-medium">Intervention requise</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

// ==========================================
// 3. PAGES TEMPORAIRES
// ==========================================
// ==========================================
// 4. LA PAGE GESTION DES AGENCES ET POSTES
// ==========================================


// ==========================================
// 4. LA PAGE GESTION DES AGENCES ET POSTES
// ==========================================
const Agences = () => {
  const [agences, setAgences] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [postes, setPostes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [nouvelleAgence, setNouvelleAgence] = useState({ nom: '' });
  const [nouveauDept, setNouveauDept] = useState({ nom: '', agence_id: '' });
  const [nouveauPoste, setNouveauPoste] = useState({ titre: '', departement_id: '' });

  const chargerStructure = async () => {
    try {
      const [resAgences, resDepts, resPostes] = await Promise.all([
        fetch('http://localhost:8000/agences/'),
        fetch('http://localhost:8000/departements/'),
        fetch('http://localhost:8000/postes/')
      ]);
      setAgences(await resAgences.json());
      setDepartements(await resDepts.json());
      setPostes(await resPostes.json());
      setLoading(false);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  useEffect(() => { chargerStructure(); }, []);

  // --- ACTIONS D'AJOUT ---
  const ajouterAgence = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:8000/agences/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nouvelleAgence) });
    setNouvelleAgence({ nom: '' }); chargerStructure();
  };
  const ajouterDepartement = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:8000/departements/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: nouveauDept.nom, agence_id: parseInt(nouveauDept.agence_id) }) });
    setNouveauDept({ nom: '', agence_id: '' }); chargerStructure();
  };
  const ajouterPoste = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:8000/postes/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titre: nouveauPoste.titre, departement_id: parseInt(nouveauPoste.departement_id) }) });
    setNouveauPoste({ titre: '', departement_id: '' }); chargerStructure();
  };

  // --- ACTIONS DE MODIFICATION ---
  const modifierItem = async (type: string, id: int, nomActuel: string, dataSupplementaire: any = {}) => {
    const nouveauNom = window.prompt("Modifier le nom :", nomActuel);
    if (!nouveauNom || nouveauNom === nomActuel) return;

    let bodyData = {};
    if (type === 'agences') bodyData = { nom: nouveauNom };
    if (type === 'departements') bodyData = { nom: nouveauNom, agence_id: dataSupplementaire.agence_id };
    if (type === 'postes') bodyData = { titre: nouveauNom, departement_id: dataSupplementaire.departement_id };

    await fetch(`http://localhost:8000/${type}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    chargerStructure();
  };

  // --- ACTIONS DE SUPPRESSION ---
  const supprimerItem = async (type: string, id: int) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    
    const res = await fetch(`http://localhost:8000/${type}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      chargerStructure();
    } else {
      const error = await res.json();
      alert(`Impossible de supprimer :\n${error.detail}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Agences & Structure</h1>
        <p className="text-slate-500 mt-1">Gérez la hiérarchie de vos sites, départements et postes de travail.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-6">
          {/* Formulaires d'ajout (inchangés visuellement) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider"><Building2 size={16} className="text-emerald-600" /> 1. Créer une Agence</h2>
            <form onSubmit={ajouterAgence} className="flex gap-2">
              <input required type="text" placeholder="Ex: Agence Douala" className="flex-1 p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={nouvelleAgence.nom} onChange={(e) => setNouvelleAgence({ nom: e.target.value })} />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-md transition-colors"><Plus size={20} /></button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider"><Network size={16} className="text-blue-600" /> 2. Ajouter un Département</h2>
            <form onSubmit={ajouterDepartement} className="space-y-3">
              <select required className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={nouveauDept.agence_id} onChange={(e) => setNouveauDept({...nouveauDept, agence_id: e.target.value})}>
                <option value="" disabled>Sélectionner une agence...</option>
                {agences.map(ag => <option key={ag.id} value={ag.id}>{ag.nom}</option>)}
              </select>
              <div className="flex gap-2">
                <input required type="text" placeholder="Ex: Crédit" className="flex-1 p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={nouveauDept.nom} onChange={(e) => setNouveauDept({ ...nouveauDept, nom: e.target.value })} />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"><Plus size={20} /></button>
              </div>
            </form>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider"><Briefcase size={16} className="text-amber-600" /> 3. Créer un Poste</h2>
            <form onSubmit={ajouterPoste} className="space-y-3">
              <select required className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={nouveauPoste.departement_id} onChange={(e) => setNouveauPoste({...nouveauPoste, departement_id: e.target.value})}>
                <option value="" disabled>Sélectionner un département...</option>
                {departements.map(dept => <option key={dept.id} value={dept.id}>{dept.nom} ({agences.find(a => a.id === dept.agence_id)?.nom})</option>)}
              </select>
              <div className="flex gap-2">
                <input required type="text" placeholder="Ex: Caissier Principal" className="flex-1 p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={nouveauPoste.titre} onChange={(e) => setNouveauPoste({ ...nouveauPoste, titre: e.target.value })} />
                <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-md transition-colors"><Plus size={20} /></button>
              </div>
            </form>
          </div>
        </div>

        {/* L'ARBORESCENCE AVEC BOUTONS D'ÉDITION */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto" style={{maxHeight: 'calc(100vh - 12rem)'}}>
          <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Cartographie du Réseau</h2>
          
          {loading ? <div className="text-center text-slate-400 py-10">Chargement...</div> : (
            <div className="space-y-6">
              {agences.map(agence => (
                <div key={agence.id} className="border border-emerald-100 rounded-lg overflow-hidden shadow-sm group">
                  
                  {/* Agence Ligne */}
                  <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="text-emerald-600" size={24} />
                      <h3 className="text-lg font-bold text-emerald-900">{agence.nom}</h3>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => modifierItem('agences', agence.id, agence.nom)} className="p-1.5 bg-white text-blue-600 rounded-md shadow-sm hover:bg-blue-50"><Pencil size={16} /></button>
                      <button onClick={() => supprimerItem('agences', agence.id)} className="p-1.5 bg-white text-red-600 rounded-md shadow-sm hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {/* Départements Ligne */}
                  <div className="p-4 space-y-4 bg-white">
                    {departements.filter(d => d.agence_id === agence.id).map(dept => (
                      <div key={dept.id} className="pl-4 ml-3 border-l-2 border-slate-200 group/dept">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Network size={16} className="text-blue-500" />
                            <h4 className="font-bold text-slate-700">{dept.nom}</h4>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover/dept:opacity-100 transition-opacity">
                            <button onClick={() => modifierItem('departements', dept.id, dept.nom, {agence_id: agence.id})} className="p-1 text-slate-400 hover:text-blue-600"><Pencil size={14} /></button>
                            <button onClick={() => supprimerItem('departements', dept.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                          </div>
                        </div>

                        {/* Postes Ligne */}
                        <div className="pl-6 space-y-2 mt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {postes.filter(p => p.departement_id === dept.id).map(poste => (
                              <div key={poste.id} className="bg-slate-50 border border-slate-200 p-2 rounded-md flex items-center justify-between group/poste hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                  <Briefcase size={14} className="text-amber-600" />
                                  <span>{poste.titre}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover/poste:opacity-100 transition-opacity">
                                  <button onClick={() => modifierItem('postes', poste.id, poste.titre, {departement_id: dept.id})} className="p-1 text-slate-400 hover:text-blue-600"><Pencil size={12} /></button>
                                  <button onClick={() => supprimerItem('postes', poste.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// ==========================================
// 3. LA PAGE DE GESTION DES ÉQUIPEMENTS
// ==========================================
const Equipements = () => {
  const [equipements, setEquipements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // L'état de notre formulaire d'ajout
  const [nouveau, setNouveau] = useState({
    reference: '', numero_serie: '', marque: '', modele: '', categorie: 'Unité Centrale'
  });

  // Fonction pour charger la liste
  const chargerEquipements = async () => {
    try {
      const reponse = await fetch('http://localhost:8000/equipements/');
      const data = await reponse.json();
      setEquipements(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  };

  useEffect(() => {
    chargerEquipements();
  }, []);

  // Fonction pour envoyer le formulaire
  const ajouterEquipement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const reponse = await fetch('http://localhost:8000/equipements/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouveau)
      });

      if (reponse.ok) {
        // On vide le formulaire
        setNouveau({ reference: '', numero_serie: '', marque: '', modele: '', categorie: 'Unité Centrale' });
        // On recharge le tableau pour voir la nouvelle machine !
        await chargerEquipements();
      } else {
        const error = await reponse.json();
        alert("Erreur : " + error.detail);
      }
    } catch (error) {
      console.error("Erreur d'ajout:", error);
    }
    setIsSubmitting(false);
  };

  // Fonction pour colorer les statuts joliment
  const getStatutBadge = (statut: string) => {
    switch(statut) {
      case 'En stock': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">En stock</span>;
      case 'En panne': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">En panne</span>;
      case 'En réparation externe': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">En réparation</span>;
      default: return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{statut}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inventaire du Parc</h1>
        <p className="text-slate-500 mt-1">Gérez l'ensemble des équipements et du matériel informatique.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : LE FORMULAIRE D'AJOUT */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MonitorSmartphone size={20} className="text-blue-600" />
            Nouvel Équipement
          </h2>
          
          <form onSubmit={ajouterEquipement} className="space-y-4">
             <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
  <input 
    type="text"
    list="categories-list"
    placeholder="Sélectionnez ou tapez librement..."
    className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
    value={nouveau.categorie}
    onChange={(e) => setNouveau({...nouveau, categorie: e.target.value})}
    required
  />
  <datalist id="categories-list">
    <option value="Unité Centrale" />
    <option value="Écran" />
    <option value="Clavier" />
    <option value="Souris" />
    <option value="Imprimante" />
    <option value="Téléphone IP" />
    <option value="Tablette" />
    <option value="Câbles Réseaux" />
  </datalist>
</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marque</label>
                <input required type="text" placeholder="Ex: HP" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                  value={nouveau.marque} onChange={(e) => setNouveau({...nouveau, marque: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
                <input required type="text" placeholder="Ex: ProDesk" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                  value={nouveau.modele} onChange={(e) => setNouveau({...nouveau, modele: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de Série (S/N)</label>
              <input required type="text" placeholder="Scannez ou saisissez" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 font-mono text-sm"
                value={nouveau.numero_serie} onChange={(e) => setNouveau({...nouveau, numero_serie: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Référence Interne</label>
              <input required type="text" placeholder="Ex: PC-CAISSE-01" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 font-mono text-sm"
                value={nouveau.reference} onChange={(e) => setNouveau({...nouveau, reference: e.target.value})} />
            </div>

            <button 
              disabled={isSubmitting}
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4 flex justify-center items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
              Enregistrer l'équipement
            </button>
          </form>
        </div>

        {/* COLONNE DROITE : LE TABLEAU D'INVENTAIRE */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Liste du matériel</h2>
            <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
              {equipements.length} au total
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Réf & S/N</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Marque/Modèle</th>
                  <th className="p-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Chargement...</td></tr>
                ) : equipements.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Aucun équipement enregistré.</td></tr>
                ) : (
                  equipements.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{eq.reference}</div>
                        <div className="font-mono text-xs text-slate-400 mt-1">{eq.numero_serie}</div>
                      </td>
                      <td className="p-4 font-medium">{eq.categorie}</td>
                      <td className="p-4">
                        {eq.marque} <span className="text-slate-400">{eq.modele}</span>
                      </td>
                      <td className="p-4">
                        {getStatutBadge(eq.statut)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
// ==========================================
// 5. LA PAGE GESTION DES EMPLOYÉS (RH)
// ==========================================
const Employes = () => {
  const [employes, setEmployes] = useState<any[]>([]);
  const [postes, setPostes] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [agences, setAgences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // État du formulaire
  const initialForm = { nom: '', prenom: '', matricule: '', telephone: '', email: '', statut: 'Actif', poste_id: '' };
  const [form, setForm] = useState(initialForm);
  const [enEdition, setEnEdition] = useState<number | null>(null);

  const chargerDonnees = async () => {
    try {
      const [resEmp, resPostes, resDepts, resAgences] = await Promise.all([
        fetch('http://localhost:8000/employes/'),
        fetch('http://localhost:8000/postes/'),
        fetch('http://localhost:8000/departements/'),
        fetch('http://localhost:8000/agences/')
      ]);
      setEmployes(await resEmp.json());
      setPostes(await resPostes.json());
      setDepartements(await resDepts.json());
      setAgences(await resAgences.json());
      setLoading(false);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  useEffect(() => { chargerDonnees(); }, []);

  // Obtenir le chemin complet du poste
  const getPosteLabel = (poste_id: number | null) => {
    if (!poste_id) return <span className="text-slate-400 italic">Aucun poste (Vacant)</span>;
    const p = postes.find(x => x.id === poste_id);
    if (!p) return "Poste inconnu";
    const d = departements.find(x => x.id === p.departement_id);
    const a = d ? agences.find(x => x.id === d.agence_id) : null;
    return (
      <span className="text-sm">
        <span className="font-semibold text-slate-700">{p.titre}</span>
        <br/><span className="text-xs text-slate-500">{a?.nom} • {d?.nom}</span>
      </span>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = enEdition ? `http://localhost:8000/employes/${enEdition}` : 'http://localhost:8000/employes/';
    const method = enEdition ? 'PUT' : 'POST';
    const payload = { ...form, poste_id: form.poste_id ? parseInt(form.poste_id) : null };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setForm(initialForm);
      setEnEdition(null);
      chargerDonnees();
    } else {
      const err = await res.json();
      alert("Erreur : " + err.detail);
    }
  };

  const editerEmploye = (emp: any) => {
    setForm({
      nom: emp.nom, prenom: emp.prenom, matricule: emp.matricule,
      telephone: emp.telephone, email: emp.email, statut: emp.statut,
      poste_id: emp.poste_id ? emp.poste_id.toString() : ''
    });
    setEnEdition(emp.id);
  };

  const annulerEdition = () => {
    setForm(initialForm);
    setEnEdition(null);
  };

  const getStatutBadge = (statut: string) => {
    switch(statut) {
      case 'Actif': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Actif</span>;
      case 'Muté': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Muté</span>;
      case 'Démissionnaire': return <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold">Démissionnaire</span>;
      case 'Licencié': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Licencié</span>;
      default: return <span>{statut}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ressources Humaines</h1>
        <p className="text-slate-500 mt-1">Gérez le personnel, les affectations aux postes et les départs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <UserPlus size={20} className={enEdition ? "text-amber-500" : "text-blue-600"} />
            {enEdition ? "Modifier l'employé" : "Nouvel Employé"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" value={form.nom} onChange={(e) => setForm({...form, nom: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prénom</label>
                <input required type="text" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" value={form.prenom} onChange={(e) => setForm({...form, prenom: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><IdCard size={14}/> Matricule</label>
              <input required type="text" placeholder="Ex: MAT-001" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 font-mono text-sm" value={form.matricule} onChange={(e) => setForm({...form, matricule: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Phone size={14}/> Téléphone</label>
                <input type="text" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={form.telephone} onChange={(e) => setForm({...form, telephone: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut</label>
                {enEdition ? (
                  <select className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={form.statut} onChange={(e) => setForm({...form, statut: e.target.value})}>
                    <option value="Actif">Actif</option>
                    <option value="Muté">Muté</option>
                    <option value="Démissionnaire">Démissionnaire</option>
                    <option value="Licencié">Licencié</option>
                  </select>
                ) : (
                  <div className="w-full p-2 border border-slate-200 rounded-md bg-slate-100 text-sm text-slate-500 cursor-not-allowed">Actif (Défaut)</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Mail size={14}/> Email pro</label>
              <input type="email" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Briefcase size={14}/> Affectation (Poste)</label>
              <select className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={form.poste_id} onChange={(e) => setForm({...form, poste_id: e.target.value})} disabled={form.statut === 'Démissionnaire' || form.statut === 'Licencié'}>
                <option value="">Aucun poste (En attente)</option>
                {postes.map(p => {
                  const d = departements.find(x => x.id === p.departement_id);
                  const a = d ? agences.find(x => x.id === d.agence_id) : null;
                  return <option key={p.id} value={p.id}>{p.titre} - {d?.nom} ({a?.nom})</option>
                })}
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button type="submit" className={`flex-1 text-white font-medium py-2 px-4 rounded-md transition-colors ${enEdition ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {enEdition ? "Mettre à jour" : "Enregistrer l'employé"}
              </button>
              {enEdition && (
                <button type="button" onClick={annulerEdition} className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-md">Annuler</button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Annuaire du personnel</h2>
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{employes.length} employé(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Identité & Contact</th>
                  <th className="p-4">Affectation</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">Chargement...</td></tr> : employes.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4"><div className="font-bold text-slate-900">{emp.nom} {emp.prenom}</div><div className="text-xs text-slate-500">{emp.matricule}</div></td>
                    <td className="p-4">{getPosteLabel(emp.poste_id)}</td>
                    <td className="p-4 text-center">{getStatutBadge(emp.statut)}</td>
                    <td className="p-4 text-right"><button onClick={() => editerEmploye(emp)} className="p-2 bg-slate-100 text-blue-600 rounded-md hover:bg-blue-50"><Pencil size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
const Incidents = () => <div><h1 className="text-3xl font-bold text-slate-900">Gestion des Pannes</h1></div>;

// ==========================================
// 4. LE ROUTEUR PRINCIPAL
// ==========================================
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agences" element={<Agences />} />
          <Route path="/equipements" element={<Equipements />} />
          <Route path="/employes" element={<Employes />} />
          <Route path="/incidents" element={<Incidents />} />
        </Routes>
      </Layout>
    </Router>
  );
}