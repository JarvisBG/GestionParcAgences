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
  IdCard,
  ArrowRightLeft,
  History,
  Wrench, 
  CheckCircle,
  FileText,
  X,
  Search, 
  Laptop, 
  Printer, 
  Cpu, 
  Keyboard, 
  Mouse, 
  Smartphone,
  Usb, 
  Cable, 
  BatteryCharging
} from 'lucide-react';
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
          <Link to="/mouvements" className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive('/mouvements')}`}>
            <ArrowRightLeft size={20} /> Mouvements & Traçabilité
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
// 2. LA PAGE TABLEAU DE BORD 
// ==========================================
const Dashboard = () => {
  const [stats, setStats] = useState({ equipements: 0, agences: 0, postes: 0, incidents: 0 });
  
  const [employes, setEmployes] = useState<any[]>([]);
  const [equipements, setEquipements] = useState<any[]>([]);
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonnees = async () => {
      try {
        const [reqEq, reqAg, reqPo, reqEmp, reqMv] = await Promise.all([
          fetch('http://127.0.0.1:8123/equipements/'),
          fetch('http://127.0.0.1:8123/agences/'),
          fetch('http://127.0.0.1:8123/postes/'),
          fetch('http://127.0.0.1:8123/employes/'),
          fetch('http://127.0.0.1:8123/mouvements/')
        ]);

        const eqData = await reqEq.json();
        const agData = await reqAg.json();
        const poData = await reqPo.json();
        const empData = await reqEmp.json();
        const mvData = await reqMv.json();

        setEquipements(eqData);
        setEmployes(empData);
        setMouvements(mvData);

        const compteIncidents = eqData.filter((eq: any) => eq.statut === "En panne").length;
        const equipementsActifs = eqData.filter((eq: any) => eq.statut !== "Mis au rebut");

        setStats({
          equipements: equipementsActifs.length,
          agences: agData.length,
          postes: poData.length,
          incidents: compteIncidents
        });
        
        setLoading(false);
      } catch (error) { console.error(error); setLoading(false); }
    };
    fetchDonnees();
  }, []);

  const getEquipementsEmploye = () => {
    if (!selectedEmpId) return [];
    const emp = employes.find(e => e.id === parseInt(selectedEmpId));
    if (!emp) return [];
    
    const nomComplet = `${emp.nom} ${emp.prenom}`;
    
    return equipements.filter(eq => {
      if (eq.statut !== 'Affecté') return false;
      const eqMvs = mouvements.filter(m => m.equipement_id === eq.id);
      const dernierMv = eqMvs[0];
      return dernierMv && dernierMv.destination === nomComplet;
    });
  };

  const equipementsActuels = getEquipementsEmploye();
  const employeSelectionne = employes.find(e => e.id === parseInt(selectedEmpId));

  const getIconeCategorie = (categorie: string) => {
    const cat = categorie.toLowerCase();
    if (cat.includes('écran')) return <MonitorSmartphone size={32} className="text-slate-400" />;
    if (cat.includes('centrale')) return <Cpu size={32} className="text-slate-400" />;
    if (cat.includes('imprimante')) return <Printer size={32} className="text-slate-400" />;
    if (cat.includes('clavier')) return <Keyboard size={32} className="text-slate-400" />;
    if (cat.includes('souris')) return <Mouse size={32} className="text-slate-400" />;
    if (cat.includes('portable')) return <Laptop size={32} className="text-slate-400" />;
    if (cat.includes('téléphone')) return <Smartphone size={32} className="text-slate-400" />;
    if (cat.includes("usb")) return <Usb size={16} className="text-slate-500" />;
    if (cat.includes("cable") || cat.includes("câble")) return <Cable size={16} className="text-slate-500" />;
    if (cat.includes("chargeur") || cat.includes("alimentation")) return <BatteryCharging size={16} className="text-amber-500" />;
    return <MonitorSmartphone size={32} className="text-slate-400" />;
  };

  if (loading) return <div className="flex justify-center h-full items-center"><Loader2 className="animate-spin text-blue-500"/></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Données en temps réel de votre parc informatique.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Équipements</CardTitle>
            <div className="bg-blue-100 p-2 rounded-full"><MonitorSmartphone className="h-6 w-6 text-blue-600" /></div>
          </CardHeader>
          <CardContent><div className="text-4xl font-black text-slate-900">{stats.equipements}</div></CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Agences</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-full"><Building2 className="h-6 w-6 text-emerald-600" /></div>
          </CardHeader>
          <CardContent><div className="text-4xl font-black text-slate-900">{stats.agences}</div></CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Postes de travail</CardTitle>
            <div className="bg-amber-100 p-2 rounded-full"><Briefcase className="h-6 w-6 text-amber-600" /></div>
          </CardHeader>
          <CardContent><div className="text-4xl font-black text-slate-900">{stats.postes}</div></CardContent>
        </Card>

        <Card className="shadow-sm border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-red-700 uppercase tracking-wider">Pannes en cours</CardTitle>
            <div className="bg-red-200 p-2 rounded-full"><AlertTriangle className="h-6 w-6 text-red-700" /></div>
          </CardHeader>
          <CardContent><div className="text-4xl font-black text-red-700">{stats.incidents}</div></CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Search size={20} className="text-blue-500"/> Audit du Matériel par Employé</h2>
            <p className="text-sm text-slate-500">Sélectionnez un collaborateur pour voir sa dotation actuelle.</p>
          </div>
          
          <select 
            className="w-full md:w-72 p-2 border border-slate-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
          >
            <option value="">-- Rechercher un employé --</option>
            {employes.filter(e => e.statut === 'Actif').map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nom} {emp.prenom} ({emp.matricule})</option>
            ))}
          </select>
        </div>

        {selectedEmpId ? (
          <div className="p-6 bg-slate-50/50">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl">
                {employeSelectionne?.nom[0]}{employeSelectionne?.prenom[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{employeSelectionne?.nom} {employeSelectionne?.prenom}</h3>
                <p className="text-sm text-slate-500 font-mono">{employeSelectionne?.matricule} • {employeSelectionne?.email}</p>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Matériel en sa possession ({equipementsActuels.length})</h4>
            
            {equipementsActuels.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border border-dashed border-slate-300 text-slate-400">
                Aucun équipement affecté à cet employé actuellement.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {equipementsActuels.map(eq => (
                  <div key={eq.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4 hover:border-blue-300 transition-colors">
                    <div className="p-3 bg-slate-50 rounded-lg shrink-0">
                      {getIconeCategorie(eq.categorie)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-600 mb-1">{eq.categorie}</div>
                      <div className="font-bold text-slate-800 text-sm">{eq.marque} {eq.modele}</div>
                      <div className="text-xs font-mono text-slate-400 mt-2 border-t border-slate-100 pt-1">
                        S/N: {eq.numero_serie}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400 bg-white">
            Utilisez le menu déroulant ci-dessus pour afficher la dotation d'un employé.
          </div>
        )}
      </div>

    </div>
  );
};

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
        fetch('http://127.0.0.1:8123/agences/'),
        fetch('http://127.0.0.1:8123/departements/'),
        fetch('http://127.0.0.1:8123/postes/')
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

  const ajouterAgence = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://127.0.0.1:8123/agences/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nouvelleAgence) });
    setNouvelleAgence({ nom: '' }); chargerStructure();
  };
  const ajouterDepartement = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://127.0.0.1:8123/departements/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: nouveauDept.nom, agence_id: parseInt(nouveauDept.agence_id) }) });
    setNouveauDept({ nom: '', agence_id: '' }); chargerStructure();
  };
  const ajouterPoste = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://127.0.0.1:8123/postes/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titre: nouveauPoste.titre, departement_id: parseInt(nouveauPoste.departement_id) }) });
    setNouveauPoste({ titre: '', departement_id: '' }); chargerStructure();
  };

  const modifierItem = async (type: string, id: number, nomActuel: string, dataSupplementaire: any = {}) => {
    const nouveauNom = window.prompt("Modifier le nom :", nomActuel);
    if (!nouveauNom || nouveauNom === nomActuel) return;

    let bodyData = {};
    if (type === 'agences') bodyData = { nom: nouveauNom };
    if (type === 'departements') bodyData = { nom: nouveauNom, agence_id: dataSupplementaire.agence_id };
    if (type === 'postes') bodyData = { titre: nouveauNom, departement_id: dataSupplementaire.departement_id };

    await fetch(`http://127.0.0.1:8123/${type}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    chargerStructure();
  };

  const supprimerItem = async (type: string, id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    
    const res = await fetch(`http://127.0.0.1:8123/${type}/${id}`, { method: 'DELETE' });
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

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto" style={{maxHeight: 'calc(100vh - 12rem)'}}>
          <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Cartographie du Réseau</h2>
          
          {loading ? <div className="text-center text-slate-400 py-10">Chargement...</div> : (
            <div className="space-y-6">
              {agences.map(agence => (
                <div key={agence.id} className="border border-emerald-100 rounded-lg overflow-hidden shadow-sm group">
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
// 5. LA PAGE DE GESTION DES ÉQUIPEMENTS (VERSION MASTER : FILTRES & PDF)
// ==========================================
const Equipements = () => {
  const [equipements, setEquipements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ÉTATS DES FILTRES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterCategorie, setFilterCategorie] = useState("Toutes");

  const formInitial = { reference: '', numero_serie: '', marque: '', modele: '', categorie: '' };
  const [nouveau, setNouveau] = useState(formInitial);
  const [enEdition, setEnEdition] = useState<number | null>(null);

  const [equipementSelectionne, setEquipementSelectionne] = useState<any>(null);
  const [historiqueMv, setHistoriqueMv] = useState<any[]>([]);
  const [historiqueInc, setHistoriqueInc] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const chargerEquipements = async () => {
    try {
      const reponse = await fetch('http://127.0.0.1:8123/equipements/');
      setEquipements(await reponse.json());
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  useEffect(() => { chargerEquipements(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = enEdition ? `http://127.0.0.1:8123/equipements/${enEdition}` : 'http://127.0.0.1:8123/equipements/';
    const method = enEdition ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouveau)
      });
      if (res.ok) {
        setNouveau(formInitial);
        setEnEdition(null);
        chargerEquipements();
      } else {
        const err = await res.json(); alert("Erreur : " + err.detail);
      }
    } catch (error) { console.error(error); }
    setIsSubmitting(false);
  };

  const editerEquipement = (eq: any) => {
    setNouveau({ reference: eq.reference, numero_serie: eq.numero_serie, marque: eq.marque, modele: eq.modele, categorie: eq.categorie });
    setEnEdition(eq.id);
  };

  const annulerEdition = () => { setNouveau(formInitial); setEnEdition(null); };

  const ouvrirFiche = async (eq: any) => {
    setEquipementSelectionne(eq);
    setLoadingDetails(true);
    try {
      const [resMv, resInc] = await Promise.all([
        fetch(`http://127.0.0.1:8123/equipements/${eq.id}/mouvements/`),
        fetch(`http://127.0.0.1:8123/equipements/${eq.id}/incidents/`)
      ]);
      if(resMv.ok) setHistoriqueMv(await resMv.json());
      if(resInc.ok) setHistoriqueInc(await resInc.json());
    } catch(e) { console.error(e); }
    setLoadingDetails(false);
  };

  const getStatutBadge = (statut: string) => {
    switch(statut) {
      case 'En stock': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">En stock</span>;
      case 'Affecté': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Affecté</span>;
      case 'En panne': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">En panne</span>;
      case 'Mis au rebut': return <span className="px-2 py-1 bg-slate-800 text-slate-200 rounded text-xs font-bold">Mis au rebut</span>;
      case 'En réparation externe': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">En réparation</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{statut}</span>;
    }
  };

  // --- LOGIQUE DE FILTRAGE ---
  const equipementsFiltres = equipements.filter(eq => {
    const texteGlobal = (eq.reference + " " + eq.numero_serie + " " + eq.marque + " " + eq.modele + " " + eq.categorie).toLowerCase();
    const matchSearch = texteGlobal.includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === "Tous" ? true : eq.statut === filterStatut;
    const matchCategorie = filterCategorie === "Toutes" ? true : eq.categorie === filterCategorie;
    return matchSearch && matchStatut && matchCategorie;
  });

  // --- KPIs DYNAMIQUES ADAPTÉS AU FILTRE ---
  const basePourCompteurs = filterCategorie === "Toutes" ? equipements : equipements.filter(e => e.categorie === filterCategorie);
  
  const totalType = basePourCompteurs.length;
  const countStock = basePourCompteurs.filter(e => e.statut === 'En stock').length;
  const countAffecte = basePourCompteurs.filter(e => e.statut === 'Affecté').length;
  const countPanne = basePourCompteurs.filter(e => e.statut === 'En panne' || e.statut === 'En réparation externe').length;

  // --- FONCTION EXPORT PDF SANS LIBRAIRIE ---
  const imprimerInventairePDF = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        aside { display: none !important; }
        main { padding: 0 !important; width: 100% !important; }
        .no-print { display: none !important; }
        .print-wide { width: 100% !important; grid-column: span 3 / span 3 !important; }
        table { width: 100% !important; border: 1px solid #cbd5e1 !important; }
        th, td { border-bottom: 1px solid #e2e8f0 !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventaire du Parc</h1>
          <p className="text-slate-500 mt-1">Consultez, filtrez et éditez l'état de votre matériel en temps réel.</p>
        </div>
        <button 
          onClick={imprimerInventairePDF}
          className="no-print bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-md shadow-sm transition-colors flex items-center gap-2 text-sm"
        >
          <FileText size={18}/> Exporter l'inventaire (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULAIRE */}
        <div className="no-print bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-6">
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${enEdition ? 'text-amber-600' : 'text-slate-800'}`}>
            <MonitorSmartphone size={20} className={enEdition ? 'text-amber-500' : 'text-blue-600'} /> 
            {enEdition ? "Corriger l'équipement" : "Nouvel Équipement"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
              <input required type="text" list="categories-list" placeholder="Sélectionnez ou tapez..." className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={nouveau.categorie} onChange={(e) => setNouveau({...nouveau, categorie: e.target.value})} />
              <datalist id="categories-list">
                <option value="Unité Centrale" /> <option value="Écran" /> <option value="Imprimante" /> <option value="Ordinateur Portable" />  <option value="Téléphone IP" /> <option value="Switch / Routeur" /> <option value="Câble Réseau" /> <option value="Onduleur" /> <option value="Souris" /> <option value="Clavier" /> <option value="Clé USB" /> <option value="Cable d'alimentation" /> <option value="Chargeur PC" /> <option value="Cable VGA" /> <option value="Cable HDMI" />
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Marque</label><input required type="text" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={nouveau.marque} onChange={(e) => setNouveau({...nouveau, marque: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label><input required type="text" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={nouveau.modele} onChange={(e) => setNouveau({...nouveau, modele: e.target.value})} /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Numéro de Série (S/N)</label><input required type="text" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={nouveau.numero_serie} onChange={(e) => setNouveau({...nouveau, numero_serie: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Référence Interne</label><input required type="text" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={nouveau.reference} onChange={(e) => setNouveau({...nouveau, reference: e.target.value})} /></div>
            
            <div className="flex gap-2 pt-4">
              <button disabled={isSubmitting} type="submit" className={`flex-1 text-white font-medium py-2 px-4 rounded-md transition-colors ${enEdition ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {enEdition ? "Enregistrer les modifs" : "Ajouter au stock"}
              </button>
              {enEdition && (
                <button type="button" onClick={annulerEdition} className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-md">Annuler</button>
              )}
            </div>
          </form>
        </div>

        {/* BLOC INVENTAIRE */}
        <div className="print-wide lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit flex flex-col">
          
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-slate-800">
                {filterCategorie === "Toutes" ? "Statistiques globales" : `Analyse : ${filterCategorie}s`}
              </h2>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {equipementsFiltres.length} affiché(s)
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white rounded border border-slate-200"><div className="text-[10px] uppercase font-bold text-slate-400">Total</div><div className="text-lg font-black text-slate-800">{totalType}</div></div>
              <div className="p-2 bg-emerald-50 rounded border border-emerald-200"><div className="text-[10px] uppercase font-bold text-emerald-500">En Stock</div><div className="text-lg font-black text-emerald-700">{countStock}</div></div>
              <div className="p-2 bg-blue-50 rounded border border-blue-200"><div className="text-[10px] uppercase font-bold text-blue-500">Affectés</div><div className="text-lg font-black text-blue-700">{countAffecte}</div></div>
              <div className="p-2 bg-red-50 rounded border border-red-200"><div className="text-[10px] uppercase font-bold text-red-500">En Panne</div><div className="text-lg font-black text-red-700">{countPanne}</div></div>
            </div>
          </div>

          <div className="no-print p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" placeholder="Filtrer par S/N, Marque, Réf..." className="w-full pl-9 p-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="p-2 border border-slate-300 rounded-md text-sm bg-slate-50 text-slate-700 font-medium outline-none" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
              <option value="Tous">Tous les statuts</option>
              <option value="En stock">📦 En stock</option>
              <option value="Affecté">👤 Affectés</option>
              <option value="En panne">⚠️ En panne</option>
              <option value="En réparation externe">🔧 En réparation</option>
              <option value="Mis au rebut">🗑️ Au rebut</option>
            </select>
            <select className="p-2 border border-slate-300 rounded-md text-sm bg-slate-50 text-slate-700 font-medium outline-none" value={filterCategorie} onChange={e => setFilterCategorie(e.target.value)}>
              <option value="Toutes">Toutes les catégories</option>
              <option value="Unité Centrale">Unités Centrales</option>
              <option value="Écran">Écrans</option>
              <option value="Imprimante">Imprimantes</option>
              <option value="Ordinateur Portable">Ordis Portables</option>
              <option value="Téléphone IP">Téléphones IP</option>
              <option value="Câble Réseau">Câbles Réseau</option>
              <option value="Switch / Routeur">Routeurs & Switches</option>
              <option value="Onduleur">Onduleurs</option>
              <option value="Souris" >Souris</option> 
              <option value="Clavier" >Clavier</option>
              <option value="Clé USB" >Clé USB</option>
              <option value="Cable d'alimentation" >Cable d'alimentation</option>
              <option value="Chargeur PC" >Chargeur PC</option>
              <option value="Cable VGA" >Cable VGA</option>
              <option value="Cable HDMI">Cable HDMI</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Réf & S/N</th>
                  <th className="p-4">Désignation</th>
                  <th className="p-4">Statut</th>
                  <th className="no-print p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* --- LA CORRECTION EST ICI : ON UTILISE LA VARIABLE LOADING --- */}
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Chargement en cours...</td></tr>
                ) : equipementsFiltres.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Aucun élément trouvé.</td></tr>
                ) : (
                  equipementsFiltres.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4"><div className="font-bold text-slate-800">{eq.reference}</div><div className="font-mono text-xs text-slate-400 mt-1">{eq.numero_serie}</div></td>
                      <td className="p-4"><div className="font-medium text-slate-900">{eq.categorie}</div><div className="text-xs text-slate-500">{eq.marque} {eq.modele}</div></td>
                      <td className="p-4">{getStatutBadge(eq.statut)}</td>
                      <td className="no-print p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => editerEquipement(eq)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"><Pencil size={16} /></button>
                          <button onClick={() => ouvrirFiche(eq)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-bold flex items-center gap-1"><FileText size={16}/> Fiche</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {equipementSelectionne && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><MonitorSmartphone className="text-blue-600" /> {equipementSelectionne.reference}</h2>
                <div className="flex gap-4 mt-2 text-sm text-slate-500">
                  <span><strong className="text-slate-700">S/N:</strong> {equipementSelectionne.numero_serie}</span>
                  <span><strong className="text-slate-700">Modèle:</strong> {equipementSelectionne.marque} {equipementSelectionne.modele}</span>
                  <span>{getStatutBadge(equipementSelectionne.statut)}</span>
                </div>
              </div>
              <button onClick={() => setEquipementSelectionne(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
              {loadingDetails ? (
                <div className="flex justify-center items-center h-40 text-slate-500"><Loader2 className="animate-spin mr-2"/> Dossier en cours...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <h3 className="font-bold text-slate-800 p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2"><ArrowRightLeft size={16}/> Affectations & Trajets</h3>
                    <div className="p-4 space-y-4">
                      {historiqueMv.length === 0 ? <p className="text-sm text-slate-500">Aucun trajet.</p> : 
                        historiqueMv.map(mv => (
                          <div key={mv.id} className="border-l-2 border-blue-200 pl-3 py-1 relative">
                            <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-2"></div>
                            <p className="text-xs text-slate-400 font-bold mb-1">{new Date(mv.date_mouvement).toLocaleDateString('fr-FR')} • {new Date(mv.date_mouvement).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="text-sm font-medium text-slate-800">{mv.origine} ➔ {mv.destination}</p>
                            <p className="text-xs text-slate-500 italic mt-0.5">Motif: {mv.motif}</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <h3 className="font-bold text-slate-800 p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2"><Wrench size={16}/> Journal des Pannes</h3>
                    <div className="p-4 space-y-4">
                      {historiqueInc.length === 0 ? <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded border border-emerald-100">Aucune panne enregistrée !</p> : 
                        historiqueInc.map(inc => (
                          <div key={inc.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-slate-500">{new Date(inc.date_panne).toLocaleDateString('fr-FR')}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${inc.statut === 'Résolu' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{inc.statut}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-800">{inc.description}</p>
                            {inc.date_resolution && <p className="text-xs text-emerald-600 mt-2">✅ Réparé le {new Date(inc.date_resolution).toLocaleDateString('fr-FR')}</p>}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. LA PAGE GESTION DES EMPLOYÉS 
// ==========================================
const Employes = () => {
  const [employes, setEmployes] = useState<any[]>([]);
  const [postes, setPostes] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [agences, setAgences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const initialForm = { nom: '', prenom: '', matricule: '', telephone: '', email: '', statut: 'Actif', poste_id: '' };
  const [form, setForm] = useState(initialForm);
  const [enEdition, setEnEdition] = useState<number | null>(null);

  const chargerDonnees = async () => {
    try {
      const [resEmp, resPostes, resDepts, resAgences] = await Promise.all([
        fetch('http://127.0.0.1:8123/employes/'),
        fetch('http://127.0.0.1:8123/postes/'),
        fetch('http://127.0.0.1:8123/departements/'),
        fetch('http://127.0.0.1:8123/agences/')
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
    const url = enEdition ? `http://127.0.0.1:8123/employes/${enEdition}` : 'http://127.0.0.1:8123/employes/';
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

// ==========================================
// 7. LA PAGE DES MOUVEMENTS ET AFFECTATIONS
// ==========================================
const Mouvements = () => {
  const [equipements, setEquipements] = useState<any[]>([]);
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [employes, setEmployes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { equipement_id: '', origine: '', destination: '', motif: '', utilisateur: 'Admin' };
  const [form, setForm] = useState(initialForm);

  const chargerDonnees = async () => {
    try {
      const [resEq, resMv, resEmp] = await Promise.all([
        fetch('http://127.0.0.1:8123/equipements/'),
        fetch('http://127.0.0.1:8123/mouvements/'),
        fetch('http://127.0.0.1:8123/employes/')
      ]);
      setEquipements(await resEq.json());
      setMouvements(await resMv.json());
      setEmployes(await resEmp.json());
      setLoading(false);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { chargerDonnees(); }, []);

  useEffect(() => {
    if (form.equipement_id) {
      const eqId = parseInt(form.equipement_id);
      const eq = equipements.find(e => e.id === eqId);
      const derniersMv = mouvements.filter(m => m.equipement_id === eqId);
      
      if (derniersMv.length > 0) {
        setForm(prev => ({ ...prev, origine: derniersMv[0].destination }));
      } else {
        setForm(prev => ({ ...prev, origine: eq?.statut === 'En stock' ? 'Stock Agence' : 'Inconnu' }));
      }
    }
  }, [form.equipement_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('http://127.0.0.1:8123/mouvements/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        equipement_id: parseInt(form.equipement_id)
      })
    });
    if (res.ok) {
      setForm(initialForm);
      chargerDonnees(); 
    } else {
      const err = await res.json();
      alert("Erreur : " + err.detail);
    }
    setIsSubmitting(false);
  };

  const getEquipementBadge = (statut: string) => {
    if (statut === 'En stock') return <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold">En stock</span>;
    if (statut === 'En panne' || statut === 'En réparation externe') return <span className="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xs font-bold">{statut}</span>;
    return <span className="text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs font-bold">{statut}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Affectations & Mouvements</h1>
        <p className="text-slate-500 mt-1">Transférez le matériel, affectez-le aux employés ou renvoyez-le en stock.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-blue-600" />
            Nouveau Mouvement
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">1. L'équipement concerné</label>
              <select required className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={form.equipement_id} onChange={(e) => setForm({...form, equipement_id: e.target.value})}>
                <option value="" disabled>Sélectionner une machine...</option>
                {equipements.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.reference} - {eq.marque} {eq.modele} ({eq.statut})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 relative">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Emplacement Actuel (Calculé)</label>
                <input readOnly type="text" className="w-full p-2 border border-slate-200 rounded-md bg-slate-100 text-sm text-slate-500 cursor-not-allowed" value={form.origine} placeholder="Sélectionnez un équipement d'abord..." />
              </div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
                <div className="bg-white p-1.5 rounded-full border border-slate-200 shadow-sm"><ArrowRightLeft size={16} className="text-blue-500 rotate-90" /></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Nouvelle Destination</label>
                <input required type="text" list="destinations" placeholder="Tapez 'Stock' ou un nom..." className="w-full p-2 border border-blue-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})} />
                <datalist id="destinations">
                  <option value="Stock Agence" />
                  <option value="Centre de Réparation (Douala)" />
                  <option value="Mise au rebut" />
                  {employes.filter(e => e.statut === 'Actif').map(emp => (
                    <option key={emp.id} value={`${emp.nom} ${emp.prenom}`} />
                  ))}
                </datalist>
                <p className="text-[10px] text-slate-500 mt-1">S'il va chez un employé, sélectionnez son nom dans la liste.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motif du transfert</label>
              <input required type="text" list="motifs" placeholder="Ex: Nouvelle affectation" className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={form.motif} onChange={(e) => setForm({...form, motif: e.target.value})} />
              <datalist id="motifs">
                <option value="Nouvelle affectation" />
                <option value="Transfert inter-agences" />
                <option value="Retour en stock (Restitution)" />
                <option value="Départ en réparation" />
                <option value="Mise au rebut" />
              </datalist>
            </div>

            <button disabled={isSubmitting || !form.equipement_id} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4">
              Enregistrer le mouvement
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><History size={18} className="text-slate-500"/> Journal des Mouvements</h2>
            <span className="text-xs font-medium bg-slate-200 text-slate-600 px-3 py-1 rounded-full">{mouvements.length} enregistrements</span>
          </div>
          
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-sm text-slate-600 relative">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold sticky top-0 border-b border-slate-200 shadow-sm">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Équipement</th>
                  <th className="p-4">Trajet (Origine ➔ Destination)</th>
                  <th className="p-4">Motif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Chargement...</td></tr>
                ) : mouvements.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Aucun mouvement enregistré.</td></tr>
                ) : (
                  mouvements.map((mv) => {
                    const eq = equipements.find(e => e.id === mv.equipement_id);
                    return (
                      <tr key={mv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 whitespace-nowrap text-xs">
                          <span className="font-bold text-slate-700">{new Date(mv.date_mouvement).toLocaleDateString('fr-FR')}</span> <br/>
                          <span className="text-slate-400">{new Date(mv.date_mouvement).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{eq?.reference || 'Machine Supprimée'}</div>
                          <div className="text-xs mt-1">{getEquipementBadge(eq?.statut || 'Inconnu')}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-xs bg-slate-100 p-1.5 rounded inline-flex">
                            <span className="text-slate-500 font-medium max-w-[120px] truncate" title={mv.origine}>{mv.origine}</span>
                            <ArrowRightLeft size={12} className="text-blue-500 shrink-0" />
                            <span className="font-bold text-slate-800 max-w-[120px] truncate" title={mv.destination}>{mv.destination}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs italic text-slate-500">
                          "{mv.motif}"
                        </td>
                      </tr>
                    );
                  })
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
// 8. LA PAGE DE GESTION DES INCIDENTS 
// ==========================================
const Incidents = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [equipements, setEquipements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { equipement_id: '', description: '', niveau_criticite: 'Moyen' };
  const [form, setForm] = useState(initialForm);

  const chargerDonnees = async () => {
    try {
      const [resInc, resEq] = await Promise.all([
        fetch('http://127.0.0.1:8123/incidents/'),
        fetch('http://127.0.0.1:8123/equipements/') 
      ]);
      
      if(resInc.ok) {
        setIncidents(await resInc.json());
      } else {
        setIncidents([]); 
      }
      
      setEquipements(await resEq.json());
      setLoading(false);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { chargerDonnees(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('http://127.0.0.1:8123/incidents/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        equipement_id: parseInt(form.equipement_id)
      })
    });

    if (res.ok) {
      chargerDonnees();
      
      // NOUVELLE LOGIQUE : Message d'alerte dynamique
      if (form.niveau_criticite === 'Critique') {
        alert("🚨 Incident Critique déclaré ! L'équipement a été retiré et marqué 'En panne'.");
      } else {
        alert("✅ Incident enregistré. La gêne est mineure, l'équipement conserve son statut et reste utilisable.");
      }
      
      setForm(initialForm);
    } else {
      const err = await res.json();
      alert("Erreur : " + err.detail);
    }
    setIsSubmitting(false);
  };

  const resoudreIncident = async (incident_id: number) => {
    if (!window.confirm("Confirmez-vous que cet équipement est réparé et remis en stock ?")) return;

    const res = await fetch(`http://127.0.0.1:8123/incidents/${incident_id}/resoudre`, {
      method: 'PUT'
    });

    if (res.ok) {
      chargerDonnees();
    } else {
      const err = await res.json();
      alert("Erreur : " + err.detail);
    }
  };

  const getCriticiteBadge = (niveau: string) => {
    if (niveau === 'Critique') return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Critique</span>;
    if (niveau === 'Faible') return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">Faible</span>;
    return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Moyen</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Incidents & Pannes</h1>
        <p className="text-slate-500 mt-1">Déclarez le matériel défectueux et suivez l'avancement des réparations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-6">
          <h2 className="text-lg font-bold text-red-700 mb-6 flex items-center gap-2">
            <AlertTriangle size={20} />
            Déclarer une panne
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Machine concernée</label>
              <select required className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={form.equipement_id} onChange={(e) => setForm({...form, equipement_id: e.target.value})}>
                <option value="" disabled>Sélectionner...</option>
                {equipements.filter(eq => eq.statut !== 'En panne' && eq.statut !== 'Mis au rebut').map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.reference} - {eq.marque} {eq.modele}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Niveau d'urgence</label>
              <select className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm" value={form.niveau_criticite} onChange={(e) => setForm({...form, niveau_criticite: e.target.value})}>
                <option value="Faible">Faible (Ne bloque pas le travail)</option>
                <option value="Moyen">Moyen (Gênant)</option>
                <option value="Critique">Critique (Bloquant, ex: Serveur ou Caisse)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description du problème</label>
              <textarea required rows={4} placeholder="L'écran ne s'allume plus, bip au démarrage..." className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-sm resize-none" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            </div>

            <button disabled={isSubmitting || !form.equipement_id} type="submit" className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4">
              Signaler l'incident
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
              <h2 className="font-bold text-red-900 flex items-center gap-2"><Wrench size={18}/> En cours de traitement</h2>
              <span className="text-xs font-bold bg-red-200 text-red-800 px-3 py-1 rounded-full">
                {incidents.filter(i => i.statut === 'En cours').length}
              </span>
            </div>
            
            <div className="p-4 space-y-3">
              {loading ? <p className="text-slate-400 text-center text-sm py-4">Chargement...</p> : 
               incidents.filter(i => i.statut === 'En cours').length === 0 ? <p className="text-slate-400 text-center text-sm py-4">Aucune panne en cours. Tout fonctionne bien ! 🎉</p> : 
               incidents.filter(i => i.statut === 'En cours').map(inc => {
                 const eq = equipements.find(e => e.id === inc.equipement_id);
                 return (
                   <div key={inc.id} className="border border-slate-200 p-4 rounded-lg flex justify-between items-center bg-slate-50">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-slate-800">{eq?.reference || "Machine inconnue"}</span>
                         {getCriticiteBadge(inc.niveau_criticite)}
                       </div>
                       <p className="text-sm text-slate-600 italic">"{inc.description}"</p>
                       <p className="text-xs text-slate-400 mt-2">Déclaré le : {new Date(inc.date_panne).toLocaleDateString('fr-FR')}</p>
                     </div>
                     <button onClick={() => resoudreIncident(inc.id)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors">
                       <CheckCircle size={16} /> Réparé
                     </button>
                   </div>
                 )
               })
              }
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-700 flex items-center gap-2"><History size={18}/> Historique des réparations</h2>
            </div>
            <div className="p-4 space-y-3 opacity-70">
              {incidents.filter(i => i.statut === 'Résolu').map(inc => {
                 const eq = equipements.find(e => e.id === inc.equipement_id);
                 return (
                   <div key={inc.id} className="border border-slate-200 p-3 rounded-lg flex justify-between items-center bg-white">
                     <div>
                       <div className="font-bold text-slate-600 text-sm">{eq?.reference} - <span className="font-normal">{inc.description}</span></div>
                       <p className="text-xs text-slate-400 mt-1">
                         Panne du {new Date(inc.date_panne).toLocaleDateString('fr-FR')} • Résolu le {inc.date_resolution ? new Date(inc.date_resolution).toLocaleDateString('fr-FR') : 'N/A'}
                       </p>
                     </div>
                     <span className="text-emerald-600 font-bold text-xs flex items-center gap-1"><CheckCircle size={14}/> Clôturé</span>
                   </div>
                 )
               })}
               {incidents.filter(i => i.statut === 'Résolu').length === 0 && !loading && (
                 <p className="text-slate-400 text-center text-sm py-4">Aucun historique de réparation.</p>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. LE ROUTEUR PRINCIPAL
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
          <Route path="/mouvements" element={<Mouvements />} />
          <Route path="/incidents" element={<Incidents />} />
        </Routes>
      </Layout>
    </Router>
  );
}