import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const STORAGE_KEY = '@ezy_chklist_data';
const SETTINGS_KEY = '@ezy_chklist_settings';
const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 360);

// Category emoji map
const CATEGORY_ICONS = {
  'Vegetables & Greens': '🥬', 'Fruits': '🍎', 'Dairy & Eggs': '🥛',
  'Bakery & Bread': '🍞', 'Pantry & Spices': '🫙', 'Snacks & Sweets': '🍫',
  'Beverages': '🥤', 'Meat & Seafood': '🥩', 'Personal Care': '🧴',
  'Household & Cleaning': '🧹', 'Frozen Foods': '🧊', 'Grains & Pulses': '🌾',
};

const getIcon = (cat) => {
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (cat.toLowerCase().includes(key.split(' ')[0].toLowerCase())) return icon;
  }
  return '📦';
};

// ─── Settings Side Panel ────────────────────────────────────────────
function SettingsPanel({ visible, onClose, apiKey, modelId, onSave }) {
  const [localKey, setLocalKey] = useState(apiKey);
  const [localModel, setLocalModel] = useState(modelId);
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : PANEL_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleSave = () => {
    onSave(localKey.trim(), localModel.trim() || DEFAULT_MODEL);
    onClose();
  };

  // Sync local state when panel opens with fresh props
  useEffect(() => {
    if (visible) {
      setLocalKey(apiKey);
      setLocalModel(modelId);
    }
  }, [visible]);

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <TouchableOpacity
          style={panelStyles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      {/* Panel */}
      <Animated.View
        style={[panelStyles.panel, { transform: [{ translateX: slideAnim }] }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View style={panelStyles.panelHeader}>
          <Text style={panelStyles.panelTitle}>⚙️ Settings</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={panelStyles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={panelStyles.panelBody} showsVerticalScrollIndicator={false}>
          {/* API Key */}
          <Text style={panelStyles.label}>Gemini API Key</Text>
          <Text style={panelStyles.hint}>
            Get yours free at ai.google.dev
          </Text>
          <TextInput
            style={panelStyles.input}
            placeholder="AIzaSy..."
            placeholderTextColor="#444"
            value={localKey}
            onChangeText={setLocalKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
          />

          {/* Model ID */}
          <Text style={[panelStyles.label, { marginTop: 24 }]}>Model ID</Text>
          <Text style={panelStyles.hint}>
            Change the Gemini model used for categorization
          </Text>
          <TextInput
            style={panelStyles.input}
            placeholder={DEFAULT_MODEL}
            placeholderTextColor="#444"
            value={localModel}
            onChangeText={setLocalModel}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Info */}
          <View style={panelStyles.infoBox}>
            <Text style={panelStyles.infoTitle}>Popular Models</Text>
            <Text style={panelStyles.infoItem}>• gemini-3.1-flash-lite</Text>
            <Text style={panelStyles.infoItem}>• gemini-2.5-flash</Text>
            <Text style={panelStyles.infoItem}>• gemini-2.0-flash</Text>
            <Text style={panelStyles.infoItem}>• gemini-1.5-flash</Text>
          </View>

          {/* Save */}
          <TouchableOpacity style={panelStyles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={panelStyles.saveBtnText}>Save Settings</Text>
          </TouchableOpacity>

          {/* Status indicator */}
          <View style={panelStyles.statusRow}>
            <View style={[panelStyles.statusDot, { backgroundColor: localKey.trim() ? '#34D399' : '#EF4444' }]} />
            <Text style={panelStyles.statusText}>
              {localKey.trim() ? 'API key configured' : 'No API key set'}
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

// ─── Confirm Modal ──────────────────────────────────────────────────
function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  if (!visible) return null;
  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.card}>
        <Text style={modalStyles.title}>{title}</Text>
        <Text style={modalStyles.message}>{message}</Text>
        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.confirmBtn} onPress={onConfirm} activeOpacity={0.7}>
            <Text style={modalStyles.confirmText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Main App ───────────────────────────────────────────────────────
export default function App() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState(DEFAULT_MODEL);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Load checklist + settings
  useEffect(() => {
    (async () => {
      try {
        const [storedList, storedSettings] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);
        if (storedList) {
          const parsed = JSON.parse(storedList);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            setChecklist(parsed);
          }
        }
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          if (settings.apiKey) setApiKey(settings.apiKey);
          if (settings.modelId) setModelId(settings.modelId);
        }
      } catch (e) {
        console.error('Failed to load data', e);
      }
    })();
  }, []);

  // Persist checklist
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
      } catch (e) {
        console.error('Failed to save checklist', e);
      }
    })();
  }, [checklist]);

  // Save settings handler
  const saveSettings = async (key, model) => {
    setApiKey(key);
    setModelId(model);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ apiKey: key, modelId: model }));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const handleCategorize = async () => {
    const rawInput = inputText.trim();
    if (!rawInput) return;

    const rawTokens = rawInput.split(/[\n,]+/).map(t => t.trim()).filter(Boolean);
    const itemsList = [];
    for (const token of rawTokens) {
      itemsList.push(...token.split(/\s+/).filter(Boolean));
    }
    if (itemsList.length === 0) return;

    if (!apiKey) {
      setShowSettings(true);
      alert('Please add your Gemini API key in Settings first.');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    const prompt = `You are an expert grocery organizer.
Categorize every item into logical grocery categories.

Rules:
1. Use categories like: "Vegetables & Greens", "Fruits", "Dairy & Eggs", "Bakery & Bread", "Pantry & Spices", "Snacks & Sweets", "Beverages", "Meat & Seafood", "Personal Care", "Household & Cleaning"
2. Create sensible categories if needed (e.g., "Frozen Foods", "Grains & Pulses").
3. NEVER use "Other" or "Miscellaneous". Deduce every item intelligently (e.g., ghee -> Dairy & Eggs, atta -> Pantry & Spices, shampoo -> Personal Care).
4. Return STRICT JSON: keys are category names, values are string arrays.

Items: ${JSON.stringify(itemsList)}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API ${response.status}: ${errBody.substring(0, 120)}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Invalid API response');

      const parsedJSON = JSON.parse(rawText);

      setChecklist((prev) => {
        const updated = { ...prev };
        for (const [category, newItems] of Object.entries(parsedJSON)) {
          if (!Array.isArray(newItems) || newItems.length === 0) continue;
          if (!updated[category]) updated[category] = [];
          const existingNames = updated[category].map(i => i.name.toLowerCase());
          newItems.forEach((itemName) => {
            if (typeof itemName === 'string' && !existingNames.includes(itemName.toLowerCase())) {
              updated[category].push({ name: itemName, checked: false });
            }
          });
        }
        return updated;
      });

      setInputText('');
    } catch (error) {
      alert(`Failed to categorize: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (category, index) => {
    setChecklist((prev) => {
      const updated = { ...prev };
      updated[category] = [...updated[category]];
      updated[category][index] = { ...updated[category][index], checked: !updated[category][index].checked };
      return updated;
    });
  };

  const clearChecklist = () => {
    setChecklist({});
    setShowConfirm(false);
  };

  const hasItems = Object.keys(checklist).length > 0;
  const totalItems = Object.values(checklist).reduce((sum, arr) => sum + arr.length, 0);
  const checkedItems = Object.values(checklist).reduce((sum, arr) => sum + arr.filter(i => i.checked).length, 0);
  const progress = totalItems > 0 ? checkedItems / totalItems : 0;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ConfirmModal
        visible={showConfirm}
        title="Clear Checklist?"
        message="This will remove all items. This action cannot be undone."
        onConfirm={clearChecklist}
        onCancel={() => setShowConfirm(false)}
      />

      <SettingsPanel
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        modelId={modelId}
        onSave={saveSettings}
      />

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛒 Ezy-Chklist</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => setShowSettings(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.settingsBtnText}>⚙️</Text>
            </TouchableOpacity>
            {hasItems && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => setShowConfirm(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>🗑</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* API key warning */}
        {!apiKey && (
          <TouchableOpacity style={styles.warningBanner} onPress={() => setShowSettings(true)} activeOpacity={0.8}>
            <Text style={styles.warningText}>⚠️  Tap here to add your Gemini API key in Settings</Text>
          </TouchableOpacity>
        )}

        {/* Progress bar */}
        {hasItems && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{checkedItems}/{totalItems} done</Text>
          </View>
        )}

        {/* Input area */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Type items: potato, onion, milk ghee bread..."
            placeholderTextColor="#555"
            value={inputText}
            onChangeText={setInputText}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.categorizeBtn, loading && styles.categorizeBtnDisabled, !inputText.trim() && !loading && styles.categorizeBtnDim]}
            onPress={handleCategorize}
            disabled={loading || !inputText.trim()}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.categorizeBtnText}>  Categorizing...</Text>
              </View>
            ) : (
              <Text style={styles.categorizeBtnText}>✨ Categorize</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Checklist */}
        <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {hasItems ? (
            Object.entries(checklist).map(([category, items]) => {
              if (!items || items.length === 0) return null;
              const catChecked = items.filter(i => i.checked).length;
              const catDone = catChecked === items.length;
              return (
                <View key={category} style={[styles.categoryCard, catDone && styles.categoryCardDone]}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryIcon}>{getIcon(category)}</Text>
                    <Text style={[styles.categoryTitle, catDone && styles.categoryTitleDone]}>{category}</Text>
                    <Text style={styles.categoryCount}>{catChecked}/{items.length}</Text>
                  </View>
                  {items.map((item, index) => (
                    <TouchableOpacity
                      key={`${category}-${index}`}
                      style={styles.itemRow}
                      activeOpacity={0.6}
                      onPress={() => toggleItem(category, index)}
                    >
                      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                        {item.checked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyText}>Your smart grocery list</Text>
              <Text style={styles.emptySubtext}>
                Type or paste your items above and tap Categorize.{'\n'}
                Items can be separated by commas, spaces, or new lines.
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ─── Settings Panel Styles ──────────────────────────────────────────
const panelStyles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 998,
  },
  panel: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: '#111119',
    zIndex: 999,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(124,111,247,0.15)',
    paddingTop: Platform.OS === 'android' ? 38 : 50,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  closeBtn: {
    fontSize: 20,
    color: '#666',
    fontWeight: '700',
    padding: 4,
  },
  panelBody: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C4B5FD',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hint: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10,
    lineHeight: 17,
  },
  input: {
    backgroundColor: '#1A1A2E',
    color: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,111,247,0.12)',
  },
  infoBox: {
    marginTop: 28,
    backgroundColor: 'rgba(124,111,247,0.06)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124,111,247,0.1)',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9B8FFF',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  saveBtn: {
    marginTop: 28,
    backgroundColor: '#7C6FF7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
});

// ─── Modal Styles ───────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 20,
    padding: 28,
    width: Math.min(SCREEN_WIDTH - 60, 340),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  message: { fontSize: 14, color: '#999', marginBottom: 24, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#2A2A3A', alignItems: 'center' },
  cancelText: { color: '#aaa', fontWeight: '600', fontSize: 15 },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#E74C3C', alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

// ─── Main Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D14' },
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? 38 : 0 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 16 : 12, paddingBottom: 12,
  },
  logo: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  settingsBtnText: { fontSize: 17 },
  clearBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(231,76,60,0.12)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(231,76,60,0.2)',
  },
  clearBtnText: { fontSize: 17 },

  // Warning banner
  warningBanner: {
    marginHorizontal: 20, marginBottom: 8,
    backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
  },
  warningText: { color: '#F59E0B', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Progress
  progressSection: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, gap: 12,
  },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#1A1A2E', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3, backgroundColor: '#34D399' },
  progressText: { fontSize: 12, color: '#6B7280', fontWeight: '600', minWidth: 55, textAlign: 'right' },

  // Input
  inputSection: { paddingHorizontal: 20, paddingBottom: 16 },
  textArea: {
    backgroundColor: '#13131F', color: '#E5E7EB', borderRadius: 16, padding: 16,
    minHeight: 90, textAlignVertical: 'top', fontSize: 15, lineHeight: 22,
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(124,111,247,0.15)',
  },
  categorizeBtn: { backgroundColor: '#7C6FF7', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  categorizeBtnDisabled: { backgroundColor: '#3D3670' },
  categorizeBtnDim: { backgroundColor: '#2E2A50' },
  categorizeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },

  // List
  listScroll: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  categoryCard: {
    backgroundColor: '#13131F', borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  categoryCardDone: { borderColor: 'rgba(52,211,153,0.2)', backgroundColor: 'rgba(52,211,153,0.04)' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  categoryIcon: { fontSize: 18 },
  categoryTitle: { fontSize: 15, fontWeight: '700', color: '#C4B5FD', flex: 1, letterSpacing: 0.2 },
  categoryTitleDone: { color: '#6EE7B7' },
  categoryCount: {
    fontSize: 12, color: '#555', fontWeight: '600',
    backgroundColor: '#1A1A2E', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden',
  },

  // Items
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7, borderWidth: 2,
    borderColor: '#3D3670', marginRight: 12, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#34D399', borderColor: '#34D399' },
  checkmark: { color: '#0D0D14', fontSize: 13, fontWeight: '900' },
  itemText: { fontSize: 16, color: '#D1D5DB', textTransform: 'capitalize' },
  itemTextChecked: { color: '#4B5563', textDecorationLine: 'line-through' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: '700', color: '#E5E7EB', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21 },
});