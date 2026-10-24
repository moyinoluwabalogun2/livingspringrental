export type AvailabilityStatus =
  | 'reserved'
  | 'booked'
  | 'blocked'
  | 'maintenance';

export type AvailabilityDay = {
  date: string;

  status:
    AvailabilityStatus;

  note: string;
};

type AvailabilityCalendarContext = {
  propertyId?: string;

  unitId?: string;

  propertyName?: string;

  unitName?: string;

  locationSlug?: string;
};

export const availabilityStatuses:
  AvailabilityStatus[] = [
  'reserved',
  'booked',
  'blocked',
  'maintenance',
];

export const availabilityStatusLabels:
  Record<
    AvailabilityStatus,
    string
  > = {
  reserved:
    'Reserved',

  booked:
    'Booked',

  blocked:
    'Blocked',

  maintenance:
    'Maintenance',
};

function safePart(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9_-]+/g,
      '-'
    )
    .replace(
      /-+/g,
      '-'
    )
    .replace(
      /^-|-$/g,
      ''
    );
}

/*
 * Every real property/unit gets
 * its own deterministic calendar.
 *
 * Example:
 *
 * property-abc123--unit-unit456
 *
 * The current Isara landing page
 * does not yet require a Firestore
 * property ID, so it gets a stable
 * compatibility calendar:
 *
 * managed-isara-remo-shortlet
 */
export function buildAvailabilityCalendarId(
  context:
    AvailabilityCalendarContext
) {
  const propertyId =
    context.propertyId
      ?.trim();

  const unitId =
    context.unitId
      ?.trim();

  if (
    propertyId &&
    unitId
  ) {
    return (
      `property-${safePart(
        propertyId
      )}` +
      `--unit-${safePart(
        unitId
      )}`
    );
  }

  if (propertyId) {
    return (
      `property-${safePart(
        propertyId
      )}` +
      '--default'
    );
  }

  const locationSlug =
    context.locationSlug
      ?.trim();

  if (locationSlug) {
    return (
      `managed-${safePart(
        locationSlug
      )}` +
      '-shortlet'
    );
  }

  return '';
}

function pad(
  value: number
) {
  return String(
    value
  ).padStart(
    2,
    '0'
  );
}

export function toDateKey(
  year: number,
  month: number,
  day: number
) {
  return (
    `${year}-` +
    `${pad(month)}-` +
    `${pad(day)}`
  );
}

export function dateToKey(
  date: Date
) {
  return toDateKey(
    date.getUTCFullYear(),
    date.getUTCMonth() +
      1,
    date.getUTCDate()
  );
}

export function parseDateKey(
  value: string
) {
  const [
    year,
    month,
    day,
  ] =
    value
      .split('-')
      .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );
}

export function enumerateDateKeys(
  startDate: string,
  endDate: string
) {
  const start =
    parseDateKey(
      startDate
    );

  const end =
    parseDateKey(
      endDate
    );

  if (
    !start ||
    !end ||
    start.getTime() >
      end.getTime()
  ) {
    return [];
  }

  const result:
    string[] = [];

  const current =
    new Date(
      start.getTime()
    );

  while (
    current.getTime() <=
    end.getTime()
  ) {
    result.push(
      dateToKey(
        current
      )
    );

    current.setUTCDate(
      current.getUTCDate() +
        1
    );

    /*
     * Firestore batch writes
     * have a finite limit.
     *
     * We intentionally cap a
     * single admin operation.
     */
    if (
      result.length >
      366
    ) {
      break;
    }
  }

  return result;
}

export function getLagosTodayKey() {
  const parts =
    new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone:
          'Africa/Lagos',

        year:
          'numeric',

        month:
          '2-digit',

        day:
          '2-digit',
      }
    ).formatToParts(
      new Date()
    );

  const year =
    parts.find(
      (
        part
      ) =>
        part.type ===
        'year'
    )?.value;

  const month =
    parts.find(
      (
        part
      ) =>
        part.type ===
        'month'
    )?.value;

  const day =
    parts.find(
      (
        part
      ) =>
        part.type ===
        'day'
    )?.value;

  if (
    !year ||
    !month ||
    !day
  ) {
    const now =
      new Date();

    return toDateKey(
      now.getUTCFullYear(),
      now.getUTCMonth() +
        1,
      now.getUTCDate()
    );
  }

  return (
    `${year}-` +
    `${month}-` +
    `${day}`
  );
}

export function getMonthBounds(
  date: Date
) {
  const year =
    date.getUTCFullYear();

  const monthIndex =
    date.getUTCMonth();

  const first =
    new Date(
      Date.UTC(
        year,
        monthIndex,
        1
      )
    );

  const last =
    new Date(
      Date.UTC(
        year,
        monthIndex + 1,
        0
      )
    );

  return {
    start:
      dateToKey(
        first
      ),

    end:
      dateToKey(
        last
      ),
  };
}

export function buildMonthGrid(
  date: Date
) {
  const year =
    date.getUTCFullYear();

  const monthIndex =
    date.getUTCMonth();

  const first =
    new Date(
      Date.UTC(
        year,
        monthIndex,
        1
      )
    );

  const offset =
    first.getUTCDay();

  const gridStart =
    new Date(
      Date.UTC(
        year,
        monthIndex,
        1 - offset
      )
    );

  return Array.from(
    {
      length: 42,
    },

    (
      _,
      index
    ) => {
      const current =
        new Date(
          gridStart
            .getTime()
        );

      current.setUTCDate(
        current.getUTCDate() +
          index
      );

      return {
        date:
          current,

        key:
          dateToKey(
            current
          ),

        currentMonth:
          current
            .getUTCMonth() ===
          monthIndex,
      };
    }
  );
}

export function formatMonthTitle(
  date: Date
) {
  return new Intl.DateTimeFormat(
    'en-GB',
    {
      month:
        'long',

      year:
        'numeric',

      timeZone:
        'UTC',
    }
  ).format(
    date
  );
}