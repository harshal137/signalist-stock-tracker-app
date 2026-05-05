'use client';

import { useState } from 'react';
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import countryList from 'react-select-country-list';


// ✅ Generic Props (FIXED)
type CountrySelectProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  required?: boolean;
};


// ✅ UI Component (no change needed except safety)
const CountrySelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  const countries = countryList().getData();

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="country-select-trigger w-full justify-between"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span>{getFlagEmoji(value)}</span>
              <span>
                {countries.find((c) => c.value === value)?.label}
              </span>
            </span>
          ) : (
            'Select your country...'
          )}

          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600" align="start">
        <Command className="bg-gray-800 border-gray-600">
          <CommandInput
            placeholder="Search countries..."
            className="country-select-input"
          />

          <CommandEmpty>No country found.</CommandEmpty>

          <CommandList className="max-h-60 bg-gray-800">
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.value}`}
                  onSelect={() => {
                    onChange(country.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 text-yellow-500',
                      value === country.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />

                  <span className="flex items-center gap-2">
                    <span>{getFlagEmoji(country.value)}</span>
                    <span>{country.label}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


// ✅ FINAL FIELD COMPONENT (FIXED)
export const CountrySelectField = <T extends FieldValues>({
  name,
  label,
  control,
  error,
  required = false,
}: CountrySelectProps<T>) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>

      <Controller
        name={name}
        control={control}
        rules={{
          required: required
            ? `Please select ${label.toLowerCase()}`
            : false,
        }}
        render={({ field }) => (
          <CountrySelect
            value={field.value ?? ''}   // ✅ important fix
            onChange={field.onChange}
          />
        )}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error.message}
        </p>
      )}

      <p className="text-xs text-gray-500">
        Helps us show market data and news relevant to you.
      </p>
    </div>
  );
};