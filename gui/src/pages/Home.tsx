import { ErrorContent } from 'components/ErrorContent';
import { Loading } from 'components/Loading';
import { LogPanel, RunPanel } from 'components/RunPanel';
import { STAT_INK } from 'constant';
import { usePromise } from 'hooks/usePromise';
import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { getConfig, getProfile } from 'services/config';
import { composeLoadable } from 'utils/composeLoadable';

export const Home: React.FC = () => {
  let { loading, error, retry } = composeLoadable({
    config: usePromise(getConfig),
    profile: usePromise(() => getProfile(0)),
  });
  const { t } = useTranslation();

  if (loading) {
    return <>
      <div className='h-full flex items-center justify-center'><Loading /></div>
    </>
  }

  if (error) {
    return <>
      <ErrorContent error={error} retry={retry} />
    </>
  }

  return <div className='flex p-2 w-full h-full gap-2'>
    <div className='max-w-full md:max-w-sm flex-auto'>
      <div className='flex flex-col gap-2'>
        <LogPanel className='sm:hidden max-h-[10rem]' />
        <RunPanel />
        <Link to='/settings' className='btn'>{t('配置')}</Link>
        <a className='btn' href={STAT_INK} target='_blank' rel='noreferrer'>{t('前往 stat.ink')}</a>
      </div>
    </div>
    <LogPanel className='hidden sm:block flex-1' />
  </div>
}
