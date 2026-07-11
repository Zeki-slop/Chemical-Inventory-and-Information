import { useCallback, useState } from 'react';
import { getAllReports, submitReportOnChain, hashReport, upvoteReportOnChain, flagReportOnChain } from '../services/web3Service.js';
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
      setError(err?.message || 'Could not load reports from the blockchain.');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReport = useCallback(async ({ productId, productName, content }) => {
    setSubmitting(true);
    setError(null);
    try {
      const reportObject = { productId, productName, content, submittedAt: Date.now() };
      const ipfsCid = await pinReportToIpfs(reportObject);
      const reportHash = hashReport(reportObject);
      const { txHash } = await submitReportOnChain({ productId, productName, reportHash, ipfsCid });
      pushToast('Report submitted and verified on-chain!', 'success');
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
  }, [fetchReports]);

  const upvote = useCallback(async (reportId) => {
    try {
      await upvoteReportOnChain(reportId);
      pushToast('Upvote recorded on-chain.', 'success');
      await fetchReports();
    } catch (err) {
      pushToast(err?.reason || err?.message || 'Upvote failed.', 'danger');
    }
  }, [fetchReports]);

  const flag = useCallback(async (reportId, reason) => {
    try {
      await flagReportOnChain(reportId, reason);
      pushToast('Report flagged for review.', 'warning');
      await fetchReports();
    } catch (err) {
      pushToast(err?.reason || err?.message || 'Flagging failed.', 'danger');
    }
  }, [fetchReports]);

  return { reports, loading, submitting, error, fetchReports, submitReport, upvote, flag };
}
