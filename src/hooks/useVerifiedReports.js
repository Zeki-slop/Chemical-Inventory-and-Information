import { useCallback, useState } from 'react';
import {
  getAllReports,
  submitReportOnChain,
  submitLocalReport,
  hashReport,
  upvoteReportOnChain,
  upvoteLocalReport,
  flagReportOnChain,
  flagLocalReport,
  isMetaMaskInstalled,
  isContractConfigured,
} from '../services/web3Service.js';
import { pinReportToIpfs } from '../services/ipfsService.js';
import { pushToast } from '../components/ToastStack.jsx';

export function useVerifiedReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllReports();
      setReports(data);
    } catch (err) {
      console.warn('[useVerifiedReports] Error fetching reports:', err);
      // Never block the user with a fatal error alert on passive fetch
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReport = useCallback(
    async ({ productId, productName, content }, submitterAddress) => {
      setSubmitting(true);
      setError(null);
      try {
        const reportObject = { productId, productName, content, submittedAt: Date.now() };
        const ipfsCid = await pinReportToIpfs(reportObject);
        const reportHash = hashReport(reportObject);

        let txHash;
        if (isMetaMaskInstalled() && isContractConfigured() && submitterAddress) {
          const result = await submitReportOnChain({ productId, productName, reportHash, ipfsCid });
          txHash = result.txHash;
          pushToast('Report submitted and verified on-chain!', 'success');
        } else {
          // Local demo submission
          const local = submitLocalReport({
            productId,
            productName,
            content,
            ipfsCid,
            reportHash,
            submitter: submitterAddress || '0x71C...39A2',
          });
          txHash = local.txHash;
          pushToast('Report submitted and verified (Demo mode)!', 'success');
        }

        await fetchReports();
        return { txHash, ipfsCid };
      } catch (err) {
        const msg = err?.reason || err?.message || 'Report submission failed.';
        setError(msg);
        pushToast(msg, 'danger');
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchReports]
  );

  const upvote = useCallback(
    async (reportId) => {
      try {
        if (isMetaMaskInstalled() && isContractConfigured() && typeof reportId === 'number') {
          await upvoteReportOnChain(reportId);
          pushToast('Upvote recorded on-chain.', 'success');
        } else {
          upvoteLocalReport(reportId);
          pushToast('Upvote recorded.', 'success');
        }
        await fetchReports();
      } catch (err) {
        pushToast(err?.reason || err?.message || 'Upvote failed.', 'danger');
      }
    },
    [fetchReports]
  );

  const flag = useCallback(
    async (reportId, reason) => {
      try {
        if (isMetaMaskInstalled() && isContractConfigured() && typeof reportId === 'number') {
          await flagReportOnChain(reportId, reason);
          pushToast('Report flagged on-chain for review.', 'warning');
        } else {
          flagLocalReport(reportId);
          pushToast('Report flagged for review.', 'warning');
        }
        await fetchReports();
      } catch (err) {
        pushToast(err?.reason || err?.message || 'Flagging failed.', 'danger');
      }
    },
    [fetchReports]
  );

  return { reports, loading, submitting, error, fetchReports, submitReport, upvote, flag };
}
