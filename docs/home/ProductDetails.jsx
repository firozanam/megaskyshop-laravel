import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { getImageWithFallback } from '@/lib/blobStorage';

export default function ProductDetails({ product, quantity, onQuantityChange }) {
  const getImageSrc = (url) => {
    if (url?.startsWith('http')) {
      return url;
    }
    return getImageWithFallback(url);
  };

  return (
    <div className="md:w-1/2">     
      <div className="flex flex-col">
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative w-1/1 aspect-square rounded-lg overflow-hidden">
            <Image
              src={getImageSrc(product.image)}
              alt={product.name}
              width={100}
              height={100}
              className="rounded-lg mb-4"
            />
          </div>
          <div className="w-2/3">
            <h3 className="text-xl font-semibold">
              {product.name}
            </h3>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
          <p className="text-gray-600">
            ক্যাটাগরি: {product.category}
          </p>
          <p className="text-xl font-bold">
            মূল্য: {formatCurrency(product.price)}
          </p>
          <div className="flex items-center space-x-2">
            <Label htmlFor="quantity" className="font-medium">
              পরিমাণ:
            </Label>
            <div className="relative">
              <Input
                type="number"
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={onQuantityChange}
                min="1"
                className="w-20 pr-8"
                style={{
                  WebkitAppearance: 'textfield',
                  MozAppearance: 'textfield',
                  appearance: 'textfield',
                }}
              />
              <style jsx>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                  opacity: 1;
                  background: transparent;
                  border-width: 0px;
                  margin: 0;
                  position: absolute;
                  top: 0;
                  right: 0;
                  bottom: 0;
                  width: 1.5em;
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
