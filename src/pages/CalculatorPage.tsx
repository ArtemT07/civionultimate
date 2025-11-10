import React, { useState, useEffect } from 'react';
import { Calculator, ChevronLeft, ChevronRight, Plus, X, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type ProjectType = 'villa' | 'townhouse' | 'commercial';
type RoofType = 'sloped' | 'flat';

type Material = {
  id: string;
  name_es: string;
  name_en: string;
  category_id: string;
  final_price: number;
  unit: string;
  photo_url?: string;
  zone_id?: string;
};

type Zone = {
  id: string;
  name_es: string;
  name_en: string;
  display_order: number;
};

type Addition = {
  material_id: string;
  material_name: string;
  zone_id: string;
  zone_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

const PROJECT_TYPES: { value: ProjectType; labelEs: string; labelEn: string }[] = [
  { value: 'villa', labelEs: 'Villa', labelEn: 'Villa' },
  { value: 'townhouse', labelEs: 'Townhouse', labelEn: 'Townhouse' },
  { value: 'commercial', labelEs: 'Comercial', labelEn: 'Commercial' },
];

const ROOF_COVERINGS: Record<RoofType, { valueEs: string; valueEn: string }[]> = {
  sloped: [
    { valueEs: 'Tejas rígidas', valueEn: 'Rigid tiles' },
    { valueEs: 'Lámina galvanizada', valueEn: 'Galvanized sheet' },
    { valueEs: 'Tejas flexibles', valueEn: 'Flexible shingles' },
  ],
  flat: [
    { valueEs: 'Impermeabilización flexible', valueEn: 'Flexible waterproofing' },
    { valueEs: 'Revestimiento de caucho', valueEn: 'Rubber coating' },
  ],
};

export const CalculatorPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [area, setArea] = useState<string>('');
  const [projectTypeIndex, setProjectTypeIndex] = useState<number>(0);
  const [floors, setFloors] = useState<number>(1);
  const [roofType, setRoofType] = useState<RoofType>('sloped');
  const [roofCovering, setRoofCovering] = useState<string>('');
  const [poolVolume, setPoolVolume] = useState<string>('0');
  const [parkingSpaces, setParkingSpaces] = useState<number>(0);
  const [basePricePerSqm, setBasePricePerSqm] = useState<number>(450);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [additions, setAdditions] = useState<Addition[]>([]);
  const [showAdditionsModal, setShowAdditionsModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);

  const [calculated, setCalculated] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const DOP_TO_USD = 58;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (roofType) {
      setRoofCovering('');
    }
  }, [roofType]);

  const loadData = async () => {
    try {
      const [materialsResult, zonesResult, categoriesResult, settingsResult] = await Promise.all([
        supabase.from('materials').select('*').eq('is_active', true),
        supabase.from('material_zones').select('*').eq('is_active', true).order('display_order'),
        supabase.from('material_categories').select('*').order('name_es'),
        supabase.from('construction_settings').select('*').eq('setting_key', 'base_price_per_sqm').maybeSingle(),
      ]);

      if (materialsResult.error) throw materialsResult.error;
      if (zonesResult.error) throw zonesResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setMaterials(materialsResult.data || []);
      setZones(zonesResult.data || []);
      setCategories(categoriesResult.data || []);

      if (settingsResult.data) {
        setBasePricePerSqm(parseFloat(settingsResult.data.setting_value as string) || 450);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateBaseCost = () => {
    const areaNum = parseFloat(area);
    if (isNaN(areaNum) || areaNum <= 0) return 0;
    return areaNum * basePricePerSqm;
  };

  const getAdditionsCostDOP = () => {
    return additions.reduce((sum, add) => sum + add.total_price, 0);
  };

  const getTotalCostUSD = () => {
    return calculateBaseCost() + getAdditionsCostDOP() / DOP_TO_USD;
  };

  const handleCalculate = () => {
    const areaNum = parseFloat(area);
    if (isNaN(areaNum) || areaNum <= 0) {
      alert(language === 'es' ? 'Por favor ingrese un área válida' : 'Please enter a valid area');
      return;
    }
    setCalculated(true);
  };

  const nextProjectType = () => {
    setProjectTypeIndex((prev) => (prev + 1) % PROJECT_TYPES.length);
  };

  const prevProjectType = () => {
    setProjectTypeIndex((prev) => (prev - 1 + PROJECT_TYPES.length) % PROJECT_TYPES.length);
  };

  const currentProjectType = PROJECT_TYPES[projectTypeIndex];

  const openAdditionsModal = () => {
    if (zones.length > 0) {
      setSelectedZone(zones[0].id);
    }
    setShowAdditionsModal(true);
  };

  const addMaterialToAdditions = (material: Material) => {
    const zoneName = zones.find((z) => z.id === selectedZone)?.[language === 'es' ? 'name_es' : 'name_en'] || '';
    const materialName = language === 'es' ? material.name_es : material.name_en;

    const existing = additions.find(
      (a) => a.material_id === material.id && a.zone_id === selectedZone
    );

    if (existing) {
      setAdditions(
        additions.map((a) =>
          a.material_id === material.id && a.zone_id === selectedZone
            ? { ...a, quantity: a.quantity + 1, total_price: (a.quantity + 1) * a.unit_price }
            : a
        )
      );
    } else {
      setAdditions([
        ...additions,
        {
          material_id: material.id,
          material_name: materialName,
          zone_id: selectedZone,
          zone_name: zoneName,
          quantity: 1,
          unit_price: material.final_price,
          total_price: material.final_price,
        },
      ]);
    }
  };

  const updateAdditionQuantity = (materialId: string, zoneId: string, quantity: number) => {
    if (quantity <= 0) {
      removeAddition(materialId, zoneId);
      return;
    }
    setAdditions(
      additions.map((a) =>
        a.material_id === materialId && a.zone_id === zoneId
          ? { ...a, quantity, total_price: quantity * a.unit_price }
          : a
      )
    );
  };

  const removeAddition = (materialId: string, zoneId: string) => {
    setAdditions(additions.filter((a) => !(a.material_id === materialId && a.zone_id === zoneId)));
  };

  const generatePDFContent = () => {
    const areaNum = parseFloat(area);
    const baseCost = calculateBaseCost();
    const additionsCostDOP = getAdditionsCostDOP();
    const totalCostUSD = getTotalCostUSD();

    let content = `
ESTIMACIÓN DE PROYECTO / PROJECT ESTIMATE
==========================================

Proyecto: ${projectName || (language === 'es' ? 'Sin nombre' : 'Unnamed')}
Tipo: ${language === 'es' ? currentProjectType.labelEs : currentProjectType.labelEn}
Área: ${areaNum.toFixed(2)} m²
Pisos: ${floors}
Tipo de techo: ${roofType === 'sloped' ? (language === 'es' ? 'Inclinado' : 'Sloped') : (language === 'es' ? 'Plano' : 'Flat')}
${roofCovering ? `Cubierta: ${roofCovering}` : ''}
Volumen de piscina: ${poolVolume} gal
Espacios de estacionamiento: ${parkingSpaces}

COSTO BASE (USD)
==================
Precio por m²: $${basePricePerSqm.toFixed(2)}
Área: ${areaNum.toFixed(2)} m²
Total: $${baseCost.toFixed(2)} USD

ADICIONES POR ZONA (DOP)
=========================
`;

    const additionsByZone = zones.reduce((acc, zone) => {
      const zoneAdditions = additions.filter((a) => a.zone_id === zone.id);
      if (zoneAdditions.length > 0) {
        acc[zone.id] = {
          name: language === 'es' ? zone.name_es : zone.name_en,
          items: zoneAdditions,
          total: zoneAdditions.reduce((sum, a) => sum + a.total_price, 0),
        };
      }
      return acc;
    }, {} as Record<string, { name: string; items: Addition[]; total: number }>);

    Object.values(additionsByZone).forEach((zone) => {
      content += `\n${zone.name}:\n`;
      zone.items.forEach((item) => {
        content += `  ${item.material_name} x ${item.quantity} = RD$${item.total_price.toFixed(2)}\n`;
      });
      content += `  Subtotal: RD$${zone.total.toFixed(2)}\n`;
    });

    content += `\nTotal Adiciones: RD$${additionsCostDOP.toFixed(2)}\n`;
    content += `\n==========================================\n`;
    content += `COSTO TOTAL: $${totalCostUSD.toFixed(2)} USD\n`;
    content += `(Costo base: $${baseCost.toFixed(2)} USD + Adiciones: RD$${additionsCostDOP.toFixed(2)})\n`;
    content += `==========================================\n`;

    return content;
  };

  const handleGeneratePDF = () => {
    const content = generatePDFContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimacion-${projectName || 'proyecto'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveProject = async () => {
    if (!user || !projectName.trim()) {
      alert(language === 'es' ? 'Por favor ingrese un nombre para el proyecto' : 'Please enter a project name');
      return;
    }

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectName,
          area: parseFloat(area),
          project_type: currentProjectType.value,
          floors_count: floors,
          roof_type: roofType,
          roof_covering: roofCovering,
          pool_volume_gallons: parseFloat(poolVolume),
          parking_spaces: parkingSpaces,
          base_price_per_sqm: basePricePerSqm,
          base_cost: calculateBaseCost(),
          materials_cost: 0,
          additions_cost_dop: getAdditionsCostDOP(),
          total_cost: getTotalCostUSD(),
          selected_materials: [],
        })
        .select()
        .single();

      if (projectError) throw projectError;

      if (additions.length > 0 && projectData) {
        const additionsData = additions.map((add) => ({
          project_id: projectData.id,
          material_id: add.material_id,
          zone_id: add.zone_id,
          quantity: add.quantity,
          unit_price_dop: add.unit_price,
          total_price_dop: add.total_price,
        }));

        const { error: additionsError } = await supabase
          .from('project_material_additions')
          .insert(additionsData);

        if (additionsError) throw additionsError;
      }

      alert(language === 'es' ? 'Proyecto guardado exitosamente' : 'Project saved successfully');
      setShowSaveModal(false);
      setProjectName('');
    } catch (error) {
      console.error('Error saving project:', error);
      alert(language === 'es' ? 'Error al guardar el proyecto' : 'Error saving project');
    }
  };

  const formatCurrencyUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatCurrencyDOP = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  const filteredMaterials = materials.filter((m) => {
    if (selectedZone && m.zone_id !== selectedZone) return false;
    if (selectedCategory !== 'all' && m.category_id !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-blue-600 rounded-xl mb-4 shadow-lg">
            <Calculator className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {language === 'es' ? 'Calculadora de Construcción' : 'Construction Calculator'}
          </h1>
          <p className="text-gray-600">
            {language === 'es' ? 'Estime el costo de su proyecto' : 'Estimate your project cost'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {language === 'es' ? 'Selección Preliminar' : 'Preliminary Selection'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'es' ? 'Área Total (m²)' : 'Total Area (m²)'}
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'es' ? 'Tipo de Proyecto' : 'Project Type'}
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevProjectType}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex-1 text-center py-2 px-4 bg-gradient-to-r from-red-50 to-blue-50 rounded-lg font-semibold text-gray-900">
                  {language === 'es' ? currentProjectType.labelEs : currentProjectType.labelEn}
                </div>
                <button
                  onClick={nextProjectType}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'es' ? 'Número de Pisos' : 'Number of Floors'}
              </label>
              <input
                type="number"
                value={floors}
                onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'es' ? 'Tipo de Techo' : 'Roof Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRoofType('sloped')}
                  className={`py-2 px-4 rounded-lg border-2 transition-all ${
                    roofType === 'sloped'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {language === 'es' ? 'Inclinada' : 'Sloped'}
                </button>
                <button
                  onClick={() => setRoofType('flat')}
                  className={`py-2 px-4 rounded-lg border-2 transition-all ${
                    roofType === 'flat'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {language === 'es' ? 'Plana' : 'Flat'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'es' ? 'Tipo de Cubierta' : 'Roof Covering'}
              </label>
              <select
                value={roofCovering}
                onChange={(e) => setRoofCovering(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  {language === 'es' ? '-- Seleccionar --' : '-- Select --'}
                </option>
                {ROOF_COVERINGS[roofType].map((covering, idx) => (
                  <option key={idx} value={language === 'es' ? covering.valueEs : covering.valueEn}>
                    {language === 'es' ? covering.valueEs : covering.valueEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'es' ? 'Volumen Piscina (galones)' : 'Pool Volume (gallons)'}
              </label>
              <input
                type="number"
                value={poolVolume}
                onChange={(e) => setPoolVolume(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'es' ? 'Espacios de Estacionamiento' : 'Parking Spaces'}
              </label>
              <input
                type="number"
                value={parkingSpaces}
                onChange={(e) => setParkingSpaces(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          {!calculated && (
            <button
              onClick={handleCalculate}
              className="w-full mt-6 bg-gradient-to-r from-red-600 to-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:from-red-700 hover:to-blue-700 transition-all shadow-lg"
            >
              {language === 'es' ? 'Calcular' : 'Calculate'}
            </button>
          )}
        </div>

        {calculated && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {language === 'es' ? 'Precio Base por m²' : 'Base Price per m²'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrencyUSD(basePricePerSqm)}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={openAdditionsModal}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>{language === 'es' ? 'Dopoluciones' : 'Additions'}</span>
                </button>

                <button
                  onClick={handleGeneratePDF}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
                >
                  <FileText size={20} />
                  <span>{language === 'es' ? 'Generar PDF' : 'Generate PDF'}</span>
                </button>

                {user && (
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all"
                  >
                    {language === 'es' ? 'Guardar Proyecto' : 'Save Project'}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'es' ? 'Resumen de Costos' : 'Cost Summary'}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <span className="text-gray-300">{language === 'es' ? 'Costo Base' : 'Base Cost'}</span>
                  <span className="text-xl font-bold">{formatCurrencyUSD(calculateBaseCost())}</span>
                </div>

                {additions.length > 0 && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-300">{language === 'es' ? 'Adiciones' : 'Additions'}</span>
                    <span className="text-xl font-bold">{formatCurrencyDOP(getAdditionsCostDOP())}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3">
                  <span className="text-xl font-semibold">{language === 'es' ? 'Total' : 'Total'}</span>
                  <span className="text-3xl font-bold text-green-400">{formatCurrencyUSD(getTotalCostUSD())}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                {language === 'es'
                  ? '* Estimado aproximado. El costo final puede variar.'
                  : '* Approximate estimate. Final cost may vary.'}
              </p>
            </div>
          </>
        )}
      </div>

      {showAdditionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {language === 'es' ? 'Seleccionar Adiciones' : 'Select Additions'}
              </h3>
              <button
                onClick={() => setShowAdditionsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'es' ? 'Zona' : 'Zone'}
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {language === 'es' ? zone.name_es : zone.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'es' ? 'Categoría' : 'Category'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{language === 'es' ? 'Todas' : 'All'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'es' ? cat.name_es : cat.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => addMaterialToAdditions(material)}
                >
                  {material.photo_url && (
                    <img
                      src={material.photo_url}
                      alt={language === 'es' ? material.name_es : material.name_en}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {language === 'es' ? material.name_es : material.name_en}
                  </h4>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrencyDOP(material.final_price)}
                  </p>
                </div>
              ))}
            </div>

            {additions.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  {language === 'es' ? 'Adiciones Seleccionadas' : 'Selected Additions'}
                </h4>
                <div className="space-y-3">
                  {additions.map((addition, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{addition.material_name}</p>
                        <p className="text-sm text-gray-600">{addition.zone_name}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="number"
                          min="1"
                          value={addition.quantity}
                          onChange={(e) =>
                            updateAdditionQuantity(
                              addition.material_id,
                              addition.zone_id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <p className="font-semibold text-gray-900 w-32 text-right">
                          {formatCurrencyDOP(addition.total_price)}
                        </p>
                        <button
                          onClick={() => removeAddition(addition.material_id, addition.zone_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowAdditionsModal(false)}
              className="mt-6 w-full bg-gradient-to-r from-red-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all"
            >
              {language === 'es' ? 'Listo' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'es' ? 'Guardar Proyecto' : 'Save Project'}
            </h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={language === 'es' ? 'Nombre del proyecto' : 'Project name'}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={saveProject}
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all"
              >
                {language === 'es' ? 'Guardar' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
