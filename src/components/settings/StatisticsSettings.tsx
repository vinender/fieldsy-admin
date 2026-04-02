import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface Statistic {
  value: string;
  label: string;
  order: number;
  id?: string;
}

interface StatisticsSettingsProps {
  stats: Statistic[];
  setStats: (stats: Statistic[]) => void;
  setHasChanges: (value: boolean) => void;
}

const CHAR_LIMITS = {
  statValue: 20,
  statLabel: 50,
};

export default function StatisticsSettings({ stats, setStats, setHasChanges }: StatisticsSettingsProps) {
  const handleAddStat = () => {
    const newStats = [...stats, {
      id: `stat-${Date.now()}-${Math.random()}`,
      value: '',
      label: '',
      order: (Math.max(...stats.map(s => s.order), 0)) + 1
    }];
    setStats(newStats);
    setHasChanges(true);
  };

  const handleUpdateStat = (id: string | undefined, field: 'value' | 'label', value: string) => {
    const newStats = [...stats];
    const statIndex = newStats.findIndex(s => s.id === id);
    if (statIndex !== -1) {
      newStats[statIndex] = { ...newStats[statIndex], [field]: value };
      setStats(newStats);
      setHasChanges(true);
    }
  };

  const handleRemoveStat = (id: string | undefined) => {
    const newStats = stats.filter((s: any) => s.id !== id);
    setStats(newStats);
    setHasChanges(true);
  };

  const handleReorder = (id: string | undefined, direction: 'up' | 'down') => {
    const sortedStats = [...stats].sort((a, b) => a.order - b.order);
    const sortedIndex = sortedStats.findIndex(s => s.id === id);

    if ((direction === 'up' && sortedIndex === 0) || (direction === 'down' && sortedIndex === sortedStats.length - 1)) {
      return;
    }

    const targetSortedIndex = direction === 'up' ? sortedIndex - 1 : sortedIndex + 1;

    // Swap order values between the two items
    const tempOrder = sortedStats[sortedIndex].order;
    sortedStats[sortedIndex].order = sortedStats[targetSortedIndex].order;
    sortedStats[targetSortedIndex].order = tempOrder;

    setStats(sortedStats);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
        <p className="text-gray-600 mb-4">Manage statistics displayed on home page and about page</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-base font-semibold">Statistics Items</Label>
          <Button
            type="button"
            onClick={handleAddStat}
            size="sm"
            className="bg-green hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Statistic
          </Button>
        </div>

        {stats.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-sm">No statistics added yet. Click "Add Statistic" to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats
              .sort((a, b) => a.order - b.order)
              .map((stat, index) => {
                const isFirst = index === 0;
                const isLast = index === stats.length - 1;

                return (
                  <div key={stat.id || stat.order} className="flex gap-2 items-start p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(stat.id, 'up')}
                        disabled={isFirst}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(stat.id, 'down')}
                        disabled={isLast}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">
                          Value (Numbers only)
                          <span className="text-xs text-gray-400 ml-1">
                            ({stat.value?.length || 0}/{CHAR_LIMITS.statValue})
                          </span>
                        </Label>
                        <Input
                          value={stat.value}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            // Only allow numbers and common symbols like +, %, -
                            if (/^[0-9+%\-]*$/.test(inputValue)) {
                              handleUpdateStat(stat.id, 'value', inputValue);
                            }
                          }}
                          maxLength={CHAR_LIMITS.statValue}
                          placeholder="e.g., 500+ or 100%"
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">
                          Label
                          <span className="text-xs text-gray-400 ml-1">
                            ({stat.label?.length || 0}/{CHAR_LIMITS.statLabel})
                          </span>
                        </Label>
                        <Input
                          value={stat.label}
                          onChange={(e) => handleUpdateStat(stat.id, 'label', e.target.value)}
                          maxLength={CHAR_LIMITS.statLabel}
                          placeholder="e.g., Happy Dogs"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleRemoveStat(stat.id)}
                      size="sm"
                      variant="destructive"
                      className="mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Preview */}
      {stats.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Label className="text-base font-semibold mb-4 block">Preview</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats
              .sort((a, b) => a.order - b.order)
              .map((stat) => (
                <div key={stat.order} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-green mb-2">{stat.value || '-'}</div>
                  <div className="text-sm text-gray-600">{stat.label || 'Label'}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Statistics are displayed on both home page and about page</li>
          <li>• Use values like "500+", "100%" for impact</li>
          <li>• Order statistics using the up/down buttons</li>
          <li>• Maximum 4 statistics recommended for optimal display</li>
        </ul>
      </div>
    </div>
  );
}
