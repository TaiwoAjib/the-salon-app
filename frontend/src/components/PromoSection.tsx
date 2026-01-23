import { useEffect, useState } from "react";
import { getActivePromos, MonthlyPromo } from "@/services/promoService";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const PromoSection = () => {
  const [promos, setPromos] = useState<MonthlyPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const data = await getActivePromos();
        if (Array.isArray(data)) {
          setPromos(data);
        } else {
          setPromos([]);
        }
      } catch (error) {
        setPromos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  if (loading || promos.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-charcoal-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="font-sans text-primary uppercase tracking-[0.3em] text-sm mb-3">
            Monthly Special
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
            Limited-Time Promotions
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <Card key={promo.id} className="border-gold/40 bg-card/90 backdrop-blur">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="mb-2 uppercase tracking-widest">
                    {promo.promoMonth} {promo.promoYear}
                  </Badge>
                  <CardTitle className="text-xl">
                    {promo.title || "Special Offer"}
                  </CardTitle>
                </div>
                <Badge>
                  ${promo.promoPrice}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-sans text-sm text-muted-foreground">
                  {promo.stylePricing?.style.name} • {promo.stylePricing?.category.name}
                </p>
                {promo.description && (
                  <p className="font-sans text-sm text-foreground">
                    {promo.description}
                  </p>
                )}
                <p className="font-sans text-xs text-muted-foreground">
                  Offer ends{" "}
                  {new Date(promo.offerEnds).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {promo.terms && promo.terms.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                    {promo.terms.slice(0, 3).map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                    {promo.terms.length > 3 && (
                      <li>Additional terms apply.</li>
                    )}
                  </ul>
                )}
                <div className="pt-4">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      try {
                        localStorage.setItem("selectedPromoId", promo.id);
                      } catch (error) {
                        console.error(error);
                      }
                      navigate(`/booking?promoId=${promo.id}`);
                    }}
                  >
                    Book This Special
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
