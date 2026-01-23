import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Calendar, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllPromos, createPromo, deletePromo, togglePromoStatus, MonthlyPromo } from '@/services/promoService';
import { styleService, Style } from '@/services/styleService';
import { toast } from 'sonner';

export const PromoSettings = () => {
  const [promos, setPromos] = useState<MonthlyPromo[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      promoMonth: '',
      promoYear: new Date().getFullYear(),
      offerEnds: '',
      stylePricingId: '',
      promoPrice: '',
      discountPercentage: '',
      promoDuration: '',
      description: '',
      terms: [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'terms',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promosData, stylesData] = await Promise.all([
        getAllPromos(),
        styleService.getAllStyles({ limit: 100 }), // Fetch all styles
      ]);
      setPromos(promosData);
      setStyles(stylesData.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        terms: data.terms.map((t: any) => t.value).filter((t: string) => t.trim() !== ''),
      };
      await createPromo(formattedData);
      toast.success('Promo created successfully');
      reset({
        title: '',
        promoMonth: '',
        promoYear: new Date().getFullYear(),
        offerEnds: '',
        stylePricingId: '',
        promoPrice: '',
        promoDuration: '',
        description: '',
        terms: [{ value: '' }],
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create promo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deletePromo(id);
      toast.success('Promo deleted');
      setPromos(promos.filter((p) => p.id !== id));
    } catch (error) {
      toast.error('Failed to delete promo');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await togglePromoStatus(id);
      setPromos(promos.map((p) => (p.id === id ? updated : p)));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Generate Style Options
  const styleOptions = styles.flatMap((style) =>
    style.pricing?.map((pricing) => ({
      id: pricing.id,
      label: `${style.name} - ${pricing.category.name} ($${pricing.price})`,
      styleName: style.name,
      price: pricing.price,
    })) || []
  );

  // Watch fields for auto-calculation
  const watchedStylePricingId = watch('stylePricingId');
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value);
    setValue('promoPrice', e.target.value);
    
    if (watchedStylePricingId && !isNaN(newPrice)) {
      const selectedOption = styleOptions.find(opt => opt.id === watchedStylePricingId);
      if (selectedOption && selectedOption.price > 0) {
        const discount = ((selectedOption.price - newPrice) / selectedOption.price) * 100;
        setValue('discountPercentage', Math.round(discount).toString());
      }
    }
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = parseFloat(e.target.value);
    setValue('discountPercentage', e.target.value);

    if (watchedStylePricingId && !isNaN(newPercentage)) {
      const selectedOption = styleOptions.find(opt => opt.id === watchedStylePricingId);
      if (selectedOption) {
        const newPrice = selectedOption.price * (1 - newPercentage / 100);
        setValue('promoPrice', newPrice.toFixed(2));
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Promotion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Promo Title (Optional)</Label>
                <Input {...register('title')} placeholder="e.g., Summer Sale" />
              </div>
              <div className="space-y-2">
                <Label>Promo Month</Label>
                <Select onValueChange={(val) => setValue('promoMonth', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Promo Year</Label>
                <Input type="number" {...register('promoYear')} />
              </div>
              <div className="space-y-2">
                <Label>Offer Ends</Label>
                <Input type="datetime-local" {...register('offerEnds')} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Service</Label>
              <Select onValueChange={(val) => setValue('stylePricingId', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service to promote" />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Promo Price ($)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  {...register('promoPrice')} 
                  onChange={handlePriceChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Percentage (%) - Optional</Label>
                <Input 
                  type="number" 
                  {...register('discountPercentage')} 
                  onChange={handlePercentageChange}
                  placeholder="e.g. 10" 
                />
              </div>
              <div className="space-y-2">
                <Label>Promo Duration (Minutes) - Optional</Label>
                <Input type="number" {...register('promoDuration')} placeholder="Leave blank to use original" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register('description')} placeholder="Marketing text..." />
            </div>

            <div className="space-y-2">
              <Label>Terms & Conditions</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input {...register(`terms.${index}.value` as const)} placeholder="e.g., Non-refundable" />
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Term
              </Button>
            </div>

            <Button type="submit">Create Promo</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => (
          <Card key={promo.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {promo.title || `${promo.promoMonth} Promo`}
              </CardTitle>
              <Switch
                checked={promo.isActive}
                onCheckedChange={() => handleToggle(promo.id)}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {promo.discountPercentage ? `${promo.discountPercentage}% OFF` : `$${promo.promoPrice}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {promo.stylePricing?.style.name} - {promo.stylePricing?.category.name}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                  Ends: {new Date(promo.offerEnds).toLocaleDateString()}
                </div>
                {promo.description && (
                  <p className="text-muted-foreground">{promo.description}</p>
                )}
              </div>
              <Button variant="destructive" size="sm" className="mt-4 w-full" onClick={() => handleDelete(promo.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
