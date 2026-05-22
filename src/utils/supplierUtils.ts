import type { ConectarPlusSupplier } from '@/app/quotationDetailsScreen';
import { CombinationSupplierDTO } from '../services/combinationsService';
import { CombinationSupplier } from "../types/suppliersDataTypes";
import { getBrazilDateTime } from './dateUtils';
import { formatTimeString } from './timeUtils';

function parseOpeningTime(timeString: string | undefined): { hour: number; minute: number } {
    const normalizedTime = timeString?.trim();

    if (!normalizedTime) {
        return { hour: 13, minute: 0 };
    }

    const [hour, minute] = normalizedTime.split(':').map(Number);

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
        return { hour: 13, minute: 0 };
    }

    return { hour, minute };
}

function createOpeningDateTime(hour: number, minute: number) {
    const openingTime = getBrazilDateTime();
    return openingTime.set({ hour, minute, second: 0, millisecond: 0 });
}

export function isSupplierOpen(openingTime: string | undefined): boolean {
    const currentTime = getBrazilDateTime();
    const { hour: openingHour, minute: openingMinute } = parseOpeningTime(openingTime);
    const supplierOpeningTime = createOpeningDateTime(openingHour, openingMinute);
    return currentTime.valueOf() >= supplierOpeningTime.valueOf();
}

export function getFormattedOpeningTime(openingTime: string | undefined): string {
    const { hour, minute } = parseOpeningTime(openingTime);
    const dateTime = createOpeningDateTime(hour, minute);
    return formatTimeString(dateTime);
}

export function getSupplierLabel(supplier: CombinationSupplier): string {
    const rateString = isNaN(Number(supplier.nota)) ? 'NOVO' : `⭐️ ${supplier.nota}`;

    return `${supplier.nomefornecedor} (${rateString})`;
}

export function getCombinationSupplierDTOLabel(supplier: CombinationSupplierDTO): string {
    const rateString = isNaN(Number(supplier.rating)) ? 'NOVO' : `⭐️ ${supplier.rating}`;

    return `${supplier.name} (${rateString})`;
}

export interface SupplierAvailabilityOnConfirm {
    openingTime: string | undefined;
    isSupplierAvailableForOrder: boolean;
    mainMessage: string | undefined;
    notificationMessage: string | undefined;
}

export function checkSupplierAvailabilityMessage(supplierOpeningTime: string | undefined): SupplierAvailabilityOnConfirm {
    const currentTime = getBrazilDateTime();
    const { hour: openingHour, minute: openingMinute } = parseOpeningTime(supplierOpeningTime);
    const openingTime = createOpeningDateTime(openingHour, openingMinute);
    const formattedOpeningTime = formatTimeString(openingTime);

    if (currentTime.valueOf() < openingTime.valueOf()) {
        return {
            openingTime: formattedOpeningTime,
            isSupplierAvailableForOrder: false,
            mainMessage: `A confirmação só pode ser feita após as ${formattedOpeningTime}`,
            notificationMessage: `Sua notificação foi agendada para as ${formattedOpeningTime} para que você possa confirmar seu pedido.`
        };
    }

    return {
        openingTime: formattedOpeningTime,
        isSupplierAvailableForOrder: true,
        mainMessage: undefined,
        notificationMessage: undefined
    };
}

export function checkSupplierAvailabilityMessageForConectarPlus(suppliers: ConectarPlusSupplier[]): SupplierAvailabilityOnConfirm {
    const currentTime = getBrazilDateTime();

    const unavailableSuppliers = suppliers.filter(supplier => {
        if (!supplier.openingTime) {
            return true;
        }

        const { hour: openingHour, minute: openingMinute } = parseOpeningTime(supplier.openingTime);
        const openingTime = createOpeningDateTime(openingHour, openingMinute);

        return currentTime.valueOf() < openingTime.valueOf();
    });

    if (unavailableSuppliers.length > 0) {
        const earliestOpeningSupplier = unavailableSuppliers.reduce<ConectarPlusSupplier | undefined>((earliest, supplier) => {
            if (!supplier.openingTime) {
                return earliest;
            }

            const { hour: openingHour, minute: openingMinute } = parseOpeningTime(supplier.openingTime);
            const openingTime = createOpeningDateTime(openingHour, openingMinute);

            if (!earliest?.openingTime) {
                return supplier;
            }

            const { hour: earliestOpeningHour, minute: earliestOpeningMinute } = parseOpeningTime(earliest.openingTime);
            const earliestOpeningTime = createOpeningDateTime(earliestOpeningHour, earliestOpeningMinute);

            if (openingTime.valueOf() < earliestOpeningTime.valueOf()) {
                return supplier;
            }

            return earliest;
        }, undefined);

        const formattedOpeningTime = earliestOpeningSupplier?.openingTime
            ? formatTimeString(createOpeningDateTime(
                parseOpeningTime(earliestOpeningSupplier.openingTime).hour,
                parseOpeningTime(earliestOpeningSupplier.openingTime).minute,
            ))
            : undefined;

        const openingTimeMessage = formattedOpeningTime ? `as ${formattedOpeningTime}` : 'o horário de abertura dos fornecedores';

        return {
            openingTime: formattedOpeningTime,
            isSupplierAvailableForOrder: false,
            mainMessage: `A confirmação só pode ser feita após ${openingTimeMessage}`,
            notificationMessage: `Sua notificação foi agendada para ${openingTimeMessage} para que você possa confirmar seu pedido.`
        };
    }

    return {
        openingTime: undefined,
        isSupplierAvailableForOrder: true,
        mainMessage: undefined,
        notificationMessage: undefined
    };
}
