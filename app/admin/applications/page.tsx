'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileWarning,
  RefreshCw,
  Search,
  WalletCards,
  
} from 'lucide-react';

import {
  fetchAdminApplications,
  type AdminApplicationSummary,
} from '@/lib/adminApplications';

import styles
  from './applications.module.css';


const FILTERS = [
  'ALL',
  'PENDING',
  'APPROVED',
  'NEEDS CHANGES',
  'REJECTED',
] as const;


function formatDate(
  value:
    string
) {
  if (
    !value
  ) {
    return '—';
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    }
  ).format(
    date
  );
}


function formatMoney(
  value:
    number
) {
  return new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',

      currency:
        'NGN',

      maximumFractionDigits:
        0,
    }
  ).format(
    value
  );
}


function statusClass(
  status:
    string
) {
  const value =
    status
      .toUpperCase();

  if (
    value ===
    'APPROVED'
  ) {
    return styles
      .statusApproved;
  }

  if (
    value ===
    'NEEDS CHANGES'
  ) {
    return styles
      .statusChanges;
  }

  if (
    value ===
    'REJECTED'
  ) {
    return styles
      .statusRejected;
  }

  return styles
    .statusPending;
}


export default function
AdminApplicationsPage() {
  const router =
    useRouter();

  const [
    applications,
    setApplications,
  ] =
    useState<
      AdminApplicationSummary[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    filter,
    setFilter,
  ] =
    useState(
      'ALL'
    );

  const [
    search,
    setSearch,
  ] =
    useState('');


  const load =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          ''
        );

        try {
          const data =
            await fetchAdminApplications(
              filter
            );

          setApplications(
            data
          );
        } catch (
          loadError
        ) {
          const message =
            loadError instanceof
            Error
              ? loadError.message
              : 'Could not load applications.';

          if (
            message ===
            'ADMIN_LOGIN_REQUIRED'
          ) {
            router.replace(
              '/admin/login'
            );

            return;
          }

          setError(
            message
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        filter,
        router,
      ]
    );


  useEffect(() => {
  const timer =
    window.setTimeout(
      () => {
        void load();
      },
      0
    );

  return () => {
    window.clearTimeout(
      timer
    );
  };
}, [
  load,
]);


  const visible =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (
          !query
        ) {
          return applications;
        }

        return applications.filter(
          (
            item
          ) =>
            [
              item.reference,
              item.applicantName,
              item.email,
              item.phone,
              item.listingTitle,
              item.propertyType,
              item.state,
              item.city,
              item.area,
            ]
              .join(
                ' '
              )
              .toLowerCase()
              .includes(
                query
              )
        );
      },
      [
        applications,
        search,
      ]
    );


  const pendingCount =
    applications.filter(
      (
        item
      ) =>
        item.reviewStatus ===
        'PENDING'
    ).length;

  const approvedCount =
    applications.filter(
      (
        item
      ) =>
        item.reviewStatus ===
        'APPROVED'
    ).length;

  const paidCount =
    applications.filter(
      (
        item
      ) =>
        item.paymentStatus ===
        'PAID'
    ).length;


  return (
    <div
      className={
        styles.page
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <span>
            LIST WITH US
          </span>

          <h1>
            Listing applications
          </h1>

          <p>
            Review owner and
            agent submissions
            before requesting
            payment or publishing
            anything publicly.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.refreshButton
          }
          onClick={() =>
            void load()
          }
          disabled={
            loading
          }
        >
          <RefreshCw
            size={17}
            aria-hidden="true"
          />

          Refresh
        </button>
      </header>


      <section
        className={
          styles.stats
        }
      >
        <article>
          <Clock3
            aria-hidden="true"
          />

          <div>
            <span>
              Pending Review
            </span>

            <strong>
              {pendingCount}
            </strong>
          </div>
        </article>

        <article>
          <CheckCircle2
            aria-hidden="true"
          />

          <div>
            <span>
              Approved
            </span>

            <strong>
              {approvedCount}
            </strong>
          </div>
        </article>

        <article>
          <WalletCards
            aria-hidden="true"
          />

          <div>
            <span>
              Paid
            </span>

            <strong>
              {paidCount}
            </strong>
          </div>
        </article>
      </section>


      <section
        className={
          styles.toolbar
        }
      >
        <div
          className={
            styles.filters
          }
        >
          {FILTERS.map(
            (
              item
            ) => (
              <button
                key={
                  item
                }
                type="button"
                className={
                  filter ===
                  item
                    ? styles
                        .activeFilter
                    : ''
                }
                onClick={() =>
                  setFilter(
                    item
                  )
                }
              >
                {item ===
                'ALL'
                  ? 'All'
                  : item}
              </button>
            )
          )}
        </div>

        <label
          className={
            styles.search
          }
        >
          <Search
            size={17}
            aria-hidden="true"
          />

          <input
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search reference, applicant or property..."
          />
        </label>
      </section>


      {error && (
        <div
          className={
            styles.error
          }
        >
          <FileWarning
            size={19}
          />

          {error}
        </div>
      )}


      {loading ? (
        <div
          className={
            styles.loading
          }
        >
          <div
            className="loading-spinner"
          />

          <p>
            Loading applications...
          </p>
        </div>
      ) : visible.length ===
        0 ? (
        <div
          className={
            styles.empty
          }
        >
          <Building2
            size={30}
            aria-hidden="true"
          />

          <h2>
            No applications found
          </h2>

          <p>
            Applications matching
            this view will appear
            here.
          </p>
        </div>
      ) : (
        <div
          className={
            styles.list
          }
        >
          {visible.map(
            (
              application
            ) => (
              <article
                key={
                  application
                    .reference
                }
                className={
                  styles
                    .applicationCard
                }
              >
                <div
                  className={
                    styles
                      .applicationTop
                  }
                >
                  <div>
                    <span
                      className={
                        styles
                          .reference
                      }
                    >
                      {
                        application
                          .reference
                      }
                    </span>

                    <h2>
                      {
                        application
                          .listingTitle
                      }
                    </h2>

                    <p>
                      {
                        application
                          .propertyType
                      }
                      {' · '}
                      {
                        application
                          .listingType
                      }
                    </p>
                  </div>

                  <span
                    className={`${styles.status} ${statusClass(
                      application
                        .reviewStatus
                    )}`}
                  >
                    {
                      application
                        .reviewStatus
                    }
                  </span>
                </div>


                <div
                  className={
                    styles.metaGrid
                  }
                >
                  <div>
                    <span>
                      Applicant
                    </span>

                    <strong>
                      {
                        application
                          .applicantName
                      }
                    </strong>

                    <small>
                      {
                        application
                          .email
                      }
                    </small>
                  </div>

                  <div>
                    <span>
                      Location
                    </span>

                    <strong>
                      {[
                        application
                          .area,
                        application
                          .city,
                        application
                          .state,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          ', '
                        ) ||
                        'Not supplied'}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Package
                    </span>

                    <strong>
                      {
                        application
                          .packageName
                      }
                    </strong>

                    <small>
                      {formatMoney(
                        application
                          .packageFee
                      )}
                    </small>
                  </div>

                  <div>
                    <span>
                      Payment
                    </span>

                    <strong>
                      {
                        application
                          .paymentStatus
                      }
                    </strong>
                  </div>
                </div>


                <footer
                  className={
                    styles.cardFooter
                  }
                >
                  <span>
                    <CalendarClock
                      size={15}
                      aria-hidden="true"
                    />

                    {formatDate(
                      application
                        .submittedAt
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/applications/${encodeURIComponent(
                          application
                            .reference
                        )}`
                      )
                    }
                  >
                    Review Application

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </button>
                </footer>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}