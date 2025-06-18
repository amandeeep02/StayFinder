import { motion } from "framer-motion";
import { Search, MapPin, Users, CalendarIcon, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";

interface HeroSectionProps {
  onSearch: (query: string, checkIn?: Date, checkOut?: Date, guests?: number) => void;
}

export const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, checkInDate, checkOutDate, guests);
  };

  const incrementGuests = () => setGuests(prev => Math.min(prev + 1, 16));
  const decrementGuests = () => setGuests(prev => Math.max(prev - 1, 1));

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-8 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [-50, 50, -50],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Find your perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}stay
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover unique accommodations around the world. From cozy apartments to luxury villas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSearch} className="relative">
            <div className="flex flex-col sm:flex-row items-center bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 gap-2 sm:gap-0">
              
              {/* Location Input */}
              <div className="flex items-center space-x-2 flex-1 px-4 py-2 w-full sm:w-auto">
                <MapPin className="w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Where are you going?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 text-lg"
                />
              </div>

              {/* Check-in Date */}
              <div className="flex items-center space-x-2 px-4 py-2 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-600 w-full sm:w-auto">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-start text-left font-normal p-0 h-auto hover:bg-transparent"
                    >
                      {checkInDate ? (
                        format(checkInDate, "MMM dd")
                      ) : (
                        <span className="text-gray-500">Check-in</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkInDate}
                      onSelect={(date) => {
                        setCheckInDate(date);
                        setIsCheckInOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out Date */}
              <div className="flex items-center space-x-2 px-4 py-2 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-600 w-full sm:w-auto">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-start text-left font-normal p-0 h-auto hover:bg-transparent"
                    >
                      {checkOutDate ? (
                        format(checkOutDate, "MMM dd")
                      ) : (
                        <span className="text-gray-500">Check-out</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkOutDate}
                      onSelect={(date) => {
                        setCheckOutDate(date);
                        setIsCheckOutOpen(false);
                      }}
                      disabled={(date) => date < (checkInDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Guests Counter */}
              <div className="flex items-center space-x-2 px-4 py-2 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-600 w-full sm:w-auto">
                <Users className="w-5 h-5 text-gray-400" />
                <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-start text-left font-normal p-0 h-auto hover:bg-transparent"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {guests} {guests === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="start">
                    <div className="flex items-center justify-between py-2">
                      <span className="font-medium">Guests</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={decrementGuests}
                          disabled={guests <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[2rem] text-center font-medium">
                          {guests}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={incrementGuests}
                          disabled={guests >= 16}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Button */}
              <div className="w-full sm:w-auto">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl w-full sm:w-auto"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};