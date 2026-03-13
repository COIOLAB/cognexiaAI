import { Logger } from '@nestjs/common';

export interface WorkingHours {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  breakStart?: string;
  breakEnd?: string;
}

export interface ShiftSchedule {
  name: string;
  workingHours: WorkingHours;
  daysOfWeek: number[]; // 0-6, Sunday = 0
  capacity: number;
  efficiency: number;
}

export interface TimeSpan {
  start: Date;
  end: Date;
  duration: number; // in milliseconds
}

export interface ProductionWindow {
  start: Date;
  end: Date;
  availableHours: number;
  capacity: number;
  shifts: ShiftSchedule[];
  holidays: Date[];
  maintenanceWindows: TimeSpan[];
}

export class TimeUtil {
  private static readonly logger = new Logger(TimeUtil.name);

  /**
   * Get current timestamp in various formats
   */
  static getCurrentTimestamp() {
    const now = new Date();
    return {
      iso: now.toISOString(),
      unix: Math.floor(now.getTime() / 1000),
      milliseconds: now.getTime(),
      utc: now.toUTCString(),
      local: now.toLocaleString(),
      date: now,
    };
  }

  /**
   * Calculate working hours between two dates
   */
  static calculateWorkingHours(
    startDate: Date,
    endDate: Date,
    workingHours: WorkingHours,
    workingDays: number[] = [1, 2, 3, 4, 5], // Monday to Friday
    holidays: Date[] = []
  ): number {
    try {
      let totalHours = 0;
      const current = new Date(startDate);
      
      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        const isWorkingDay = workingDays.includes(dayOfWeek);
        const isHoliday = holidays.some(holiday => 
          holiday.toDateString() === current.toDateString()
        );

        if (isWorkingDay && !isHoliday) {
          const dayStart = this.parseTimeToDate(workingHours.start, current);
          const dayEnd = this.parseTimeToDate(workingHours.end, current);
          
          // Handle breaks
          let breakTime = 0;
          if (workingHours.breakStart && workingHours.breakEnd) {
            const breakStart = this.parseTimeToDate(workingHours.breakStart, current);
            const breakEnd = this.parseTimeToDate(workingHours.breakEnd, current);
            breakTime = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
          }

          // Calculate intersection with the requested period
          const periodStart = new Date(Math.max(startDate.getTime(), dayStart.getTime()));
          const periodEnd = new Date(Math.min(endDate.getTime(), dayEnd.getTime()));

          if (periodStart < periodEnd) {
            const dayHours = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60);
            totalHours += Math.max(0, dayHours - breakTime);
          }
        }

        current.setDate(current.getDate() + 1);
      }

      return Math.round(totalHours * 100) / 100;
    } catch (error) {
      this.logger.error(`Error calculating working hours: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate next available production slot
   */
  static getNextAvailableSlot(
    duration: number, // in hours
    earliestStart: Date,
    shifts: ShiftSchedule[],
    holidays: Date[] = [],
    maintenanceWindows: TimeSpan[] = []
  ): Date | null {
    try {
      let searchDate = new Date(earliestStart);
      const maxSearchDays = 30; // Limit search to prevent infinite loop
      let daysSearched = 0;

      while (daysSearched < maxSearchDays) {
        const dayOfWeek = searchDate.getDay();
        const isHoliday = holidays.some(holiday => 
          holiday.toDateString() === searchDate.toDateString()
        );

        if (!isHoliday) {
          // Find shifts for this day
          const availableShifts = shifts.filter(shift => 
            shift.daysOfWeek.includes(dayOfWeek)
          );

          for (const shift of availableShifts) {
            const shiftStart = this.parseTimeToDate(shift.workingHours.start, searchDate);
            const shiftEnd = this.parseTimeToDate(shift.workingHours.end, searchDate);
            
            // Adjust start time if it's in the past
            const slotStart = new Date(Math.max(shiftStart.getTime(), searchDate.getTime()));
            const slotEnd = new Date(slotStart.getTime() + duration * 60 * 60 * 1000);

            // Check if slot fits within shift
            if (slotEnd <= shiftEnd) {
              // Check for maintenance conflicts
              const hasMaintenanceConflict = maintenanceWindows.some(window =>
                (slotStart < window.end && slotEnd > window.start)
              );

              if (!hasMaintenanceConflict) {
                return slotStart;
              }
            }
          }
        }

        searchDate.setDate(searchDate.getDate() + 1);
        daysSearched++;
      }

      return null; // No available slot found
    } catch (error) {
      this.logger.error(`Error finding next available slot: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate production capacity for a given time period
   */
  static calculateProductionCapacity(
    startDate: Date,
    endDate: Date,
    shifts: ShiftSchedule[],
    holidays: Date[] = [],
    maintenanceWindows: TimeSpan[] = []
  ): ProductionWindow {
    try {
      let totalAvailableHours = 0;
      let totalCapacity = 0;
      const current = new Date(startDate);

      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        const isHoliday = holidays.some(holiday => 
          holiday.toDateString() === current.toDateString()
        );

        if (!isHoliday) {
          const dayShifts = shifts.filter(shift => 
            shift.daysOfWeek.includes(dayOfWeek)
          );

          for (const shift of dayShifts) {
            const shiftStart = this.parseTimeToDate(shift.workingHours.start, current);
            const shiftEnd = this.parseTimeToDate(shift.workingHours.end, current);
            
            let shiftHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);
            
            // Subtract break time
            if (shift.workingHours.breakStart && shift.workingHours.breakEnd) {
              const breakStart = this.parseTimeToDate(shift.workingHours.breakStart, current);
              const breakEnd = this.parseTimeToDate(shift.workingHours.breakEnd, current);
              const breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
              shiftHours -= breakHours;
            }

            // Subtract maintenance time
            const maintenanceTime = maintenanceWindows.reduce((total, window) => {
              const overlap = this.calculateOverlap(
                { start: shiftStart, end: shiftEnd },
                { start: window.start, end: window.end }
              );
              return total + overlap;
            }, 0);

            const availableHours = Math.max(0, shiftHours - maintenanceTime);
            totalAvailableHours += availableHours;
            totalCapacity += availableHours * shift.capacity * (shift.efficiency / 100);
          }
        }

        current.setDate(current.getDate() + 1);
      }

      return {
        start: startDate,
        end: endDate,
        availableHours: Math.round(totalAvailableHours * 100) / 100,
        capacity: Math.round(totalCapacity * 100) / 100,
        shifts,
        holidays,
        maintenanceWindows,
      };
    } catch (error) {
      this.logger.error(`Error calculating production capacity: ${error.message}`);
      return {
        start: startDate,
        end: endDate,
        availableHours: 0,
        capacity: 0,
        shifts: [],
        holidays: [],
        maintenanceWindows: [],
      };
    }
  }

  /**
   * Calculate overlap between two time periods in hours
   */
  static calculateOverlap(period1: TimeSpan, period2: TimeSpan): number {
    try {
      const overlapStart = new Date(Math.max(period1.start.getTime(), period2.start.getTime()));
      const overlapEnd = new Date(Math.min(period1.end.getTime(), period2.end.getTime()));
      
      if (overlapStart >= overlapEnd) {
        return 0;
      }

      return (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);
    } catch (error) {
      this.logger.error(`Error calculating overlap: ${error.message}`);
      return 0;
    }
  }

  /**
   * Add business hours to a date
   */
  static addBusinessHours(
    startDate: Date,
    hoursToAdd: number,
    workingHours: WorkingHours,
    workingDays: number[] = [1, 2, 3, 4, 5]
  ): Date {
    try {
      let remainingHours = hoursToAdd;
      const current = new Date(startDate);

      while (remainingHours > 0) {
        const dayOfWeek = current.getDay();
        
        if (workingDays.includes(dayOfWeek)) {
          const dayStart = this.parseTimeToDate(workingHours.start, current);
          const dayEnd = this.parseTimeToDate(workingHours.end, current);
          
          let dailyWorkingHours = (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60 * 60);
          
          // Subtract break time
          if (workingHours.breakStart && workingHours.breakEnd) {
            const breakStart = this.parseTimeToDate(workingHours.breakStart, current);
            const breakEnd = this.parseTimeToDate(workingHours.breakEnd, current);
            const breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
            dailyWorkingHours -= breakHours;
          }

          if (remainingHours <= dailyWorkingHours) {
            // Remaining hours fit within this day
            return new Date(current.getTime() + remainingHours * 60 * 60 * 1000);
          } else {
            // Use all available hours for this day
            remainingHours -= dailyWorkingHours;
          }
        }

        // Move to next day
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0, 0, 0);
      }

      return current;
    } catch (error) {
      this.logger.error(`Error adding business hours: ${error.message}`);
      return startDate;
    }
  }

  /**
   * Get shift schedule for a specific date and time
   */
  static getCurrentShift(date: Date, shifts: ShiftSchedule[]): ShiftSchedule | null {
    try {
      const dayOfWeek = date.getDay();
      const currentTime = date.getHours() * 60 + date.getMinutes();

      for (const shift of shifts) {
        if (shift.daysOfWeek.includes(dayOfWeek)) {
          const startTime = this.parseTimeToMinutes(shift.workingHours.start);
          const endTime = this.parseTimeToMinutes(shift.workingHours.end);

          // Handle shifts that cross midnight
          if (startTime > endTime) {
            if (currentTime >= startTime || currentTime <= endTime) {
              return shift;
            }
          } else {
            if (currentTime >= startTime && currentTime <= endTime) {
              return shift;
            }
          }
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Error getting current shift: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate time until next maintenance window
   */
  static getTimeUntilNextMaintenance(
    currentDate: Date,
    maintenanceWindows: TimeSpan[]
  ): { nextMaintenance: Date | null; hoursUntil: number } {
    try {
      const upcomingMaintenances = maintenanceWindows
        .filter(window => window.start > currentDate)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      if (upcomingMaintenances.length === 0) {
        return { nextMaintenance: null, hoursUntil: 0 };
      }

      const nextMaintenance = upcomingMaintenances[0];
      const hoursUntil = (nextMaintenance.start.getTime() - currentDate.getTime()) / (1000 * 60 * 60);

      return {
        nextMaintenance: nextMaintenance.start,
        hoursUntil: Math.round(hoursUntil * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error calculating time until next maintenance: ${error.message}`);
      return { nextMaintenance: null, hoursUntil: 0 };
    }
  }

  /**
   * Format duration in human-readable format
   */
  static formatDuration(milliseconds: number): string {
    try {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else {
        return `${seconds}s`;
      }
    } catch (error) {
      this.logger.error(`Error formatting duration: ${error.message}`);
      return '0s';
    }
  }

  /**
   * Get time zone offset for manufacturing plants in different locations
   */
  static getTimeZoneOffset(timeZone: string): number {
    try {
      const now = new Date();
      const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const targetTime = new Date(utcTime.toLocaleString('en-US', { timeZone }));
      return (targetTime.getTime() - utcTime.getTime()) / (1000 * 60 * 60);
    } catch (error) {
      this.logger.error(`Error getting timezone offset: ${error.message}`);
      return 0;
    }
  }

  /**
   * Convert time string to minutes since midnight
   */
  private static parseTimeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Parse time string and create Date object for specific day
   */
  private static parseTimeToDate(timeString: string, date: Date): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  /**
   * Check if date falls within business hours
   */
  static isBusinessHour(
    date: Date,
    workingHours: WorkingHours,
    workingDays: number[] = [1, 2, 3, 4, 5]
  ): boolean {
    try {
      const dayOfWeek = date.getDay();
      if (!workingDays.includes(dayOfWeek)) {
        return false;
      }

      const currentMinutes = date.getHours() * 60 + date.getMinutes();
      const startMinutes = this.parseTimeToMinutes(workingHours.start);
      const endMinutes = this.parseTimeToMinutes(workingHours.end);

      // Check if during break time
      if (workingHours.breakStart && workingHours.breakEnd) {
        const breakStartMinutes = this.parseTimeToMinutes(workingHours.breakStart);
        const breakEndMinutes = this.parseTimeToMinutes(workingHours.breakEnd);
        
        if (currentMinutes >= breakStartMinutes && currentMinutes <= breakEndMinutes) {
          return false;
        }
      }

      // Handle shifts that cross midnight
      if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      } else {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      }
    } catch (error) {
      this.logger.error(`Error checking business hour: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate shift schedule for a week
   */
  static generateWeeklySchedule(
    startDate: Date,
    shifts: ShiftSchedule[]
  ): Array<{ date: Date; shift: ShiftSchedule | null; capacity: number }> {
    try {
      const schedule = [];
      const current = new Date(startDate);

      for (let day = 0; day < 7; day++) {
        const dayOfWeek = current.getDay();
        const dayShifts = shifts.filter(shift => 
          shift.daysOfWeek.includes(dayOfWeek)
        );

        const totalCapacity = dayShifts.reduce((total, shift) => {
          const workingHours = this.calculateWorkingHours(
            current,
            new Date(current.getTime() + 24 * 60 * 60 * 1000),
            shift.workingHours,
            [dayOfWeek]
          );
          return total + workingHours * shift.capacity * (shift.efficiency / 100);
        }, 0);

        schedule.push({
          date: new Date(current),
          shift: dayShifts.length > 0 ? dayShifts[0] : null,
          capacity: Math.round(totalCapacity * 100) / 100,
        });

        current.setDate(current.getDate() + 1);
      }

      return schedule;
    } catch (error) {
      this.logger.error(`Error generating weekly schedule: ${error.message}`);
      return [];
    }
  }
}
