"use client"

import React, {useEffect} from 'react';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {DATA} from "@/lib/data";
import LinearProgress from "@/components/linear-progress";
import {Button} from "@/components/ui/button";
import Table from "@/components/table";
import {format} from "date-fns";
import {cn, getOrganization, getStatusBadgeClasses, getTransactionBadgeClasses, toTitleCase} from "@/lib/utils";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {retrieveOrganization} from "@/store/organization/actions";
import {retrieveActiveSubscription} from "@/store/subscription/actions";
import NoData from "@/components/no-data";
import Loader from "@/components/loader";
import {listOrders} from "@/store/order/actions";


const creditTableColumns = [
  {
    id: 'id',
    header: 'Id',
    cell: ({row}) => {
      return <div>{row.id.split('-')[0]}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'created',
    header: 'Created',
    cell: ({row}) => {
      return <div>{format(new Date(row.created), 'dd LLL yyyy')}</div>
    },

  },
  {
    id: 'transaction_type',
    header: 'Transaction',
    cell: ({row}) => {
      return <Badge>{toTitleCase(row.transaction_type)}</Badge>
    },
  },
  {
    id: 'amount',
    header: 'Amount',
    cell: ({row}) => {
      return <div>{parseFloat(row.amount).toFixed(1)}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
]

const Badge = ({ className, children }) => {
  const getBadgeClasses = (value) => {

  }

  return (
    <span className={cn(
      'px-2 py-1 text-xs rounded-full',
      getTransactionBadgeClasses(children),
      className,
    )}>
      {children}
    </span>
  );
};

function CreditCard({ }) {
  const dispatch = useDispatch();

  const { error: orgError, loading: orgLoading, organization } = useSelector(state => state.retrieveOrganization);
  const { error: subscriptionError, loading: subscriptionLoading, subscription } = useSelector(state => state.retrieveActiveSubscription);

  useEffect(() => {
    if(orgError) {
      toast.error(orgError.message);
    } else if(!orgError && !orgLoading && !organization) {
      dispatch(retrieveOrganization(
        getOrganization()
      ))
    }
  }, [orgError, orgLoading, organization]);

  useEffect(() => {
    if(subscriptionError) {
      toast.error(subscriptionError.message);
    } else if(!subscriptionError && !subscriptionLoading && !subscription) {
      dispatch(retrieveActiveSubscription());
    }
  }, [subscriptionError, subscriptionLoading, subscription]);

  return (
    <Card className='h-full w-full justify-between'>
      {
        (subscription) && (
          <CardHeader className='w-full items-start'>
            <CardTitle className='h-full w-full'>
              <div className='flex flex-row justify-between'>
                <span className='flex flex-col'>{subscription.plan.name} Plan</span>
                <span className='flex flex-row text-baseline'>${parseFloat(subscription.plan?.price || "0").toFixed(0)} <span className='text-foreground/60 font-normal text-sm'>/month</span></span>
              </div>
            </CardTitle>

            <CardDescription>
              Free for individual use for upto 5 interviews.
            </CardDescription>
          </CardHeader>
        )
      }

      {
        (orgLoading || subscriptionLoading) ? (
          <Loader />
        ) : (organization && subscription) ? (
          <CardContent>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-row font-semibold text-xs'>
                {parseFloat(organization.credits).toFixed(0)}/{parseFloat(subscription.plan.credits).toFixed(0)} interviews left
              </div>

              <div className='flex flex-row'>
                <LinearProgress
                  value={subscription.plan.credits-organization.credits}
                  maxValue={subscription.plan.credits}
                  getColors={(value) => {
                    if (value >= 80) {
                      return 'bg-red-500';
                    } else if (value >= 60) {
                      return 'bg-orange-500';
                    } else if (value >= 40) {
                      return 'bg-yellow-500';
                    } else {
                      return 'bg-green-500';
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        ) : (
          <NoData text='Something went wrong. Please try again later.' />
        )
      }
    </Card>
  )
}

function EnterpriseCard({ }) {
  return (
    <Card className={cn(
      'h-full w-full justify-between text-white',
      // 'bg-conic-110 from-blue-900 to-blue-500',
      'bg-gradient-to-br from-blue-900 to-blue-500',
    )}>
      <CardHeader className='h-full w-full'>
        <CardTitle className='h-full w-full'>
          Enterprise
        </CardTitle>

        <CardDescription className='text-white/80'>
          For large hiring requirements.
        </CardDescription>
      </CardHeader>

      <CardContent>
        Connect with us to get your plan if you have a large or custom hiring requirements.
      </CardContent>

      <CardFooter>
        <Button
          variant='outline'
          className='text-foreground'
          onClick={() => window.open(process.env.NEXT_PUBLIC_CAL_LINK, '_blank')}
        >
          Contact Us &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
}

function CreditHistoryCard({ }) {
  const dispatch = useDispatch();

  const { error, loading, orders } = useSelector(state => state.listOrders);

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!error && !loading && !orders) {
      dispatch(listOrders({}));
    }
  }, [error, loading, orders]);

  return (
    <Card className='h-full w-full justify-between'>
      <CardHeader className='h-full w-full'>
        <CardTitle className='h-full w-full'>
          Usage History
        </CardTitle>

        <CardDescription>
          Your interview usage history.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table columns={creditTableColumns} data={orders?.results} loading={loading} />
      </CardContent>

      <CardFooter>
      </CardFooter>
    </Card>
  )
}

export default function Billing(props) {
  const dispatch = useDispatch();

  const { error: orgError, loading: orgLoading, organization } = useSelector(state => state.retrieveOrganization);
  const { error: subscriptionError, loading: subscriptionLoading, subscription } = useSelector(state => state.retrieveActiveSubscription);

  useEffect(() => {
    if(orgError) {
      toast.error(orgError.message);
    } else if(!orgError && !orgLoading && !organization) {
      dispatch(retrieveOrganization(
        getOrganization()
      ))
    }
  }, [orgError, orgLoading, organization]);

  useEffect(() => {
    if(subscriptionError) {
      toast.error(subscriptionError.message);
    } else if(!subscriptionError && !subscriptionLoading && !subscription) {
      dispatch(retrieveActiveSubscription());
    }
  }, [subscriptionError, subscriptionLoading, subscription  ]);

  return (
    <div className='flex flex-col h-full w-full gap-4 p-4'>
      <div className='flex md:flex-row flex-col gap-4'>
        <CreditCard />
        <EnterpriseCard />
      </div>

      <div className='flex flex-col'>
        <CreditHistoryCard />
      </div>
    </div>
  );
}