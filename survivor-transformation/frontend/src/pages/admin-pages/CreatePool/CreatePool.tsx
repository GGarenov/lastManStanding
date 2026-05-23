import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '~/components/AdminLayout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/Card/Card';
import { Button } from '~/components/Button/Button';
import { Input } from '~/components/Input/Input';
import { Textarea } from '~/components/Textarea/Textarea';
import { Label } from '~/components/Label/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/Select/Select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import * as adminApi from '~/api/admin.api';
import { usePoolsStore } from '~/store/poolsStore';
import { getAllTournamentOptions } from '~/config/tournaments';
import styles from './CreatePool.module.less';

export default function CreatePool() {
  const navigate = useNavigate();
  const fetchPools = usePoolsStore((s) => s.fetchPools);
  const tournamentOptions = getAllTournamentOptions();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tournamentKey: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Pool name is required');
      return;
    }

    if (formData.name.trim().length < 3) {
      toast.error('Pool name must be at least 3 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const pool = await adminApi.createPool({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        tournamentKey: formData.tournamentKey.trim() || undefined,
      });
      toast.success('Pool created successfully!');
      await fetchPools();
      navigate(`/admin/pool/${pool.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create pool';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.page}>
        <Button
          variant="ghost"
          className={styles.backButton}
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Pool</CardTitle>
            <CardDescription>
              Set up a new survivor pool. You can add rounds and manage participants after creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <Label htmlFor="name">Pool Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., NFL Survivor 2024"
                  className={styles.control}
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your pool rules or theme..."
                  className={`${styles.control} ${styles.textarea}`}
                  rows={3}
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="tournament">Tournament</Label>
                <Select
                  value={formData.tournamentKey || 'none'}
                  onValueChange={(v) =>
                    setFormData({ ...formData, tournamentKey: v === 'none' ? '' : v })
                  }
                >
                  <SelectTrigger id="tournament" className={styles.control}>
                    <SelectValue placeholder="Select tournament (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {tournamentOptions.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className={styles.helperText}>
                  Links the pool to a tournament config for team flags and Add match dropdowns.
                </p>
              </div>

              <div className={styles.actions}>
                <Button type="button" variant="outline" onClick={() => navigate('/admin')} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Pool'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
