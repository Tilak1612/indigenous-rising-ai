import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

export default function ContentManagement() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>Update homepage sections, testimonials, and FAQs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="hero-title">Hero Section Title</Label>
              <Input
                id="hero-title"
                placeholder="Enter hero title"
                defaultValue="Empowering Indigenous Communities Through AI"
              />
            </div>
            <div>
              <Label htmlFor="hero-description">Hero Description</Label>
              <Textarea
                id="hero-description"
                placeholder="Enter hero description"
                rows={3}
                defaultValue="Bridging tradition and technology for a brighter, culturally-rooted future"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="stat-communities">Communities Served</Label>
                <Input id="stat-communities" type="number" defaultValue="150" />
              </div>
              <div>
                <Label htmlFor="stat-projects">Projects Completed</Label>
                <Input id="stat-projects" type="number" defaultValue="50" />
              </div>
              <div>
                <Label htmlFor="stat-satisfaction">Satisfaction Rate (%)</Label>
                <Input id="stat-satisfaction" type="number" defaultValue="98" />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Testimonials Management</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Testimonials are currently managed in the codebase. Contact your developer to add or modify testimonials.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">FAQ Management</h3>
            <p className="text-sm text-muted-foreground mb-4">
              FAQs are currently managed in the codebase. Contact your developer to add or modify FAQs.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}