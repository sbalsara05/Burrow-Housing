import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import { AppDispatch } from '../../../redux/slices/store';
import { selectCurrentUser } from '../../../redux/slices/authSlice';

interface DashboardStats {
	placesViewed: number;
	upcomingViewings: number;
	nextViewing: {
		address: string;
		time: string;
	} | null;
	pendingFollowUps: number;
	completionRate: number;
	targetRate: number;
}

interface ScheduleItem {
	id: string;
	address: string;
	clientName: string;
	time: string;
	statusColor: string;
	propertyId: string;
	requestId: string;
}

interface ActivityItem {
	id: string;
	activity: string;
	timeAgo: string;
	requestId: string;
}

const AmbassadorDashboardBody: React.FC = () => {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
	const [activities, setActivities] = useState<ActivityItem[]>([]);
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const user = useSelector(selectCurrentUser);

	// Redirect if user is not an active ambassador
	useEffect(() => {
		if (user && (!user.isAmbassador || user.ambassadorStatus !== 'active')) {
			navigate('/dashboard/dashboard-index');
		}
	}, [user, navigate]);

	useEffect(() => {
		if (user?.isAmbassador && user?.ambassadorStatus === 'active') {
			fetchDashboardData();
		}
	}, [dispatch, user]);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			const [statsRes, scheduleRes, activityRes] = await Promise.all([
				axios.get('/api/ambassador/dashboard/stats'),
				axios.get('/api/ambassador/dashboard/schedule'),
				axios.get('/api/ambassador/dashboard/activity'),
			]);

			setStats(statsRes.data);
			setSchedule(scheduleRes.data.schedule || []);
			setActivities(activityRes.data.activities || []);
		} catch (error: any) {
			console.error('Error fetching ambassador dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="dashboard-body">
				<div className="position-relative">
					<DashboardHeaderTwo title="Ambassador Dashboard" />
					<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
						<div className="spinner-border" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const getStatusColorClass = (color: string) => {
		switch (color) {
			case 'red':
				return 'bg-danger';
			case 'orange':
				return 'bg-warning';
			case 'green':
				return 'bg-success';
			default:
				return 'bg-secondary';
		}
	};

	const getCompletionRateColor = (rate: number, target: number) => {
		if (rate >= target) return 'text-success';
		if (rate >= target - 10) return 'text-warning';
		return 'text-danger';
	};

	return (
		<div className="dashboard-body">
			<div className="position-relative">
				<DashboardHeaderTwo title="Ambassador Dashboard" />

				<h2 className="main-title d-block d-lg-none">Ambassador Dashboard</h2>
				<p className="text-muted mb-4">Welcome back, Ambassador</p>

				{/* Stats Cards */}
				<div className="bg-white border-20 mb-30">
					<div className="row g-3">
						{/* Places Viewed */}
						<div className="col-lg-3 col-6">
							<div className="dash-card-one bg-white border-30 position-relative mb-15">
								<div className="d-sm-flex align-items-center justify-content-between">
									<div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1 bg-success bg-opacity-10">
										<i className="bi bi-check-circle-fill text-success fs-4"></i>
									</div>
									<div className="order-sm-0">
										<span className="text-muted small">Places Viewed</span>
										<div className="value fw-500">{stats?.placesViewed || 0}</div>
										{stats && (
											<small className="text-success">+12% from last month</small>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Upcoming Viewings */}
						<div className="col-lg-3 col-6">
							<div className="dash-card-one bg-white border-30 position-relative mb-15">
								<div className="d-sm-flex align-items-center justify-content-between">
									<div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1 bg-warning bg-opacity-10">
										<i className="bi bi-calendar-check text-warning fs-4"></i>
									</div>
									<div className="order-sm-0">
										<span className="text-muted small">Upcoming Viewings</span>
										<div className="value fw-500">{stats?.upcomingViewings || 0}</div>
										{stats?.nextViewing && (
											<small className="text-muted">Next: Today at {stats.nextViewing.time}</small>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Pending Follow-ups */}
						<div className="col-lg-3 col-6">
							<div className="dash-card-one bg-white border-30 position-relative mb-15">
								<div className="d-sm-flex align-items-center justify-content-between">
									<div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1 bg-danger bg-opacity-10">
										<i className="bi bi-clock text-danger fs-4"></i>
									</div>
									<div className="order-sm-0">
										<span className="text-muted small">Pending Follow-ups</span>
										<div className="value fw-500">{stats?.pendingFollowUps || 0}</div>
									</div>
								</div>
							</div>
						</div>

						{/* Completion Rate */}
						<div className="col-lg-3 col-6">
							<div className="dash-card-one bg-white border-30 position-relative mb-15">
								<div className="d-sm-flex align-items-center justify-content-between">
									<div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1 bg-info bg-opacity-10">
										<i className="bi bi-check-circle text-info fs-4"></i>
									</div>
									<div className="order-sm-0">
										<span className="text-muted small">Completion Rate</span>
										<div className={`value fw-500 ${getCompletionRateColor(stats?.completionRate || 0, stats?.targetRate || 90)}`}>
											{stats?.completionRate || 0}%
										</div>
										{stats && stats.completionRate >= stats.targetRate && (
											<small className="text-success">Above target ({stats.targetRate}%)</small>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Schedule and Activity Row */}
				<div className="row gx-xxl-5 d-flex pt-15 lg-pt-10">
					{/* Today's Schedule */}
					<div className="col-xl-7 col-lg-6 d-flex flex-column">
						<div className="bg-white border-20 mt-30 h-100">
							<div className="d-flex align-items-center justify-content-between plr pt-30 pb-20">
								<h5 className="dash-title-two">Today's Schedule</h5>
							</div>
							<div className="plr pb-30">
								{schedule.length === 0 ? (
									<p className="text-muted text-center py-4">No scheduled viewings for today</p>
								) : (
									<div className="schedule-list">
										{schedule.map((item) => (
											<div
												key={item.id}
												className="d-flex align-items-center justify-content-between py-3 border-bottom"
											>
												<div className="flex-grow-1">
													<div className="fw-500 mb-1">{item.address}</div>
													<div className="text-muted small">
														{item.clientName} • Move-out Inspection
													</div>
													<div className="text-muted small mt-1">{item.time}</div>
												</div>
												<div
													className={`rounded ${getStatusColorClass(item.statusColor)}`}
													style={{ width: '12px', height: '12px', minWidth: '12px' }}
												></div>
											</div>
										))}
									</div>
								)}
								<div className="pt-20">
									<button className="btn-two w-100" style={{ backgroundColor: '#ff6b35', border: 'none', color: 'white' }}>
										<span>View All Viewings</span>
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Recent Activity */}
					<div className="col-xl-5 col-lg-6 d-flex">
						<div className="bg-white border-20 mt-30 plr w-100">
							<div className="pt-30 pb-20">
								<h5 className="dash-title-two">Recent Activity</h5>
							</div>
							<div className="pb-30">
								{activities.length === 0 ? (
									<p className="text-muted text-center py-4">No recent activity</p>
								) : (
									<div className="activity-list">
										{activities.map((item) => (
											<div
												key={item.id}
												className="d-flex align-items-start justify-content-between py-3 border-bottom"
											>
												<div className="flex-grow-1">
													<div className="text-muted small mb-1">{item.activity}</div>
													<div className="text-muted" style={{ fontSize: '0.75rem' }}>
														{item.timeAgo}
													</div>
												</div>
												<i className="bi bi-arrow-up-right text-muted"></i>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AmbassadorDashboardBody;
